import type { Course, Lesson, Unit } from "@/types/course";
import { allCourses, findCourseExact, lessonHref, lessonsForCourse } from "@/lib/course-data";
import { courseProjectsFor, projectStatus, type CourseProject, type CourseProjectStatus } from "@/lib/course-projects";
import { progressForCourse } from "@/lib/course-progress";
import type { EnrollmentRecord, ProgressSnapshot } from "@/lib/progress";

export type CourseModuleUser = { id: string; name?: string | null; email?: string | null };
export type CourseEnrollmentStatus = "NOT_ENROLLED" | "ENROLLED" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type CourseCatalogItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: Course["careerPath"];
  difficulty: string;
  duration: string;
  moduleCount: number;
  lessonCount: number;
  projectCount: 2;
  skills: string[];
  status: "published";
  enrollmentStatus?: CourseEnrollmentStatus;
  progress?: number;
};

export type NextLearningItem =
  | { type: "LESSON"; courseId: string; courseSlug: string; moduleId: string; lessonId: string; href: string }
  | { type: "PROJECT"; courseId: string; courseSlug: string; projectSlug: string; href: string }
  | null;

export type CurriculumModule = {
  type: "MODULE";
  id: string;
  courseId: string;
  unitId: string;
  order: number;
  title: string;
  description: string;
  lessonCount: number;
  quizCount: number;
  lessons: Array<Pick<Lesson, "id" | "title" | "description" | "type" | "duration"> & { order: number; href: string }>;
};

export type CurriculumSequenceItem =
  | { type: "MODULE"; id: string; order: number; title: string; status: "AVAILABLE" | "COMPLETED"; locked: boolean; progress: number; lessons: Array<{ id: string; title: string; type: Lesson["type"]; href: string }> }
  | { type: "PROJECT"; id: string; order: number; title: string; status: CourseProjectStatus; locked: boolean; progress: number; prerequisiteUnitIds: string[]; project: CourseProject };

export type CourseCurriculum = {
  course: CourseCatalogItem;
  modules: CurriculumModule[];
  projects: CourseProject[];
  sequence: CurriculumSequenceItem[];
};

function completedLessonKeys(snapshot: ProgressSnapshot) {
  return new Set(snapshot.progressRecords.filter((record) => record.completed).map((record) => `${record.courseId}/${record.unitId}/${record.lessonId}`));
}

function hasCourseActivity(course: Course, snapshot: ProgressSnapshot) {
  return snapshot.progressRecords.some((record) => record.courseId === course.id) ||
    Object.values(snapshot.minorProjectSubmissions ?? {}).some((submission) => submission.courseId === course.id) ||
    Boolean(snapshot.quizScores && Object.values(snapshot.quizScores).some((score) => score.courseId === course.id));
}

export function courseCatalogItem(course: Course, snapshot?: ProgressSnapshot): CourseCatalogItem {
  const progress = snapshot ? progressForCourse(course, snapshot) : undefined;
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    description: course.shortDescription,
    category: course.careerPath,
    difficulty: course.level,
    duration: course.duration,
    moduleCount: course.units.length,
    lessonCount: course.units.reduce((total, unit) => total + unit.lessons.length, 0),
    projectCount: 2,
    skills: course.tags,
    status: "published",
    ...(snapshot ? { enrollmentStatus: courseEnrollmentStatus(course, snapshot), progress: progress?.percentage ?? 0 } : {}),
  };
}

export function courseEnrollmentStatus(course: Course, snapshot: ProgressSnapshot): CourseEnrollmentStatus {
  const enrolled = Boolean(snapshot.enrollments[course.id]);
  const progress = progressForCourse(course, snapshot);
  if (progress.complete) return "COMPLETED";
  if (!enrolled && !hasCourseActivity(course, snapshot)) return "NOT_ENROLLED";
  if (!hasCourseActivity(course, snapshot)) return "NOT_STARTED";
  return "IN_PROGRESS";
}

export function nextLearningItem(course: Course, snapshot: ProgressSnapshot): NextLearningItem {
  const completed = completedLessonKeys(snapshot);
  const last = snapshot.lastLesson;
  if (last?.courseSlug === course.slug) {
    const remembered = course.units.find((unit) => unit.id === last.unitId)?.lessons.find((lesson) => lesson.id === last.lessonId);
    if (remembered && !completed.has(`${course.id}/${last.unitId}/${last.lessonId}`)) {
      return { type: "LESSON", courseId: course.id, courseSlug: course.slug, moduleId: last.unitId, lessonId: last.lessonId, href: lessonHref(course.slug, last.unitId, last.lessonId) };
    }
  }
  const nextLesson = lessonsForCourse(course.slug).find(({ unit, lesson }) => !completed.has(`${course.id}/${unit.id}/${lesson.id}`));
  if (nextLesson) return { type: "LESSON", courseId: course.id, courseSlug: course.slug, moduleId: nextLesson.unit.id, lessonId: nextLesson.lesson.id, href: lessonHref(course.slug, nextLesson.unit.id, nextLesson.lesson.id) };
  const nextProject = courseProjectsFor(course).find((project) => projectStatus(project, course, completed, snapshot.minorProjectSubmissions?.[project.slug]) !== "COMPLETED");
  return nextProject ? { type: "PROJECT", courseId: course.id, courseSlug: course.slug, projectSlug: nextProject.slug, href: `/learn/${course.slug}/project/${nextProject.slug}` } : null;
}

export function courseCurriculum(course: Course, snapshot?: ProgressSnapshot): CourseCurriculum {
  const projects = courseProjectsFor(course);
  const completed = snapshot ? completedLessonKeys(snapshot) : new Set<string>();
  const modules = course.units.map((unit, index) => ({
    type: "MODULE" as const,
    id: `${course.id}--${unit.id}`,
    courseId: course.id,
    unitId: unit.id,
    order: index + 1,
    title: unit.title,
    description: unit.description,
    lessonCount: unit.lessons.length,
    quizCount: unit.lessons.filter((lesson) => lesson.type === "quiz").length,
    lessons: unit.lessons.map((lesson, lessonIndex) => ({ id: lesson.id, order: lessonIndex + 1, title: lesson.title, description: lesson.description, type: lesson.type, duration: lesson.duration, href: lessonHref(course.slug, unit.id, lesson.id) })),
  }));
  const sequence: CurriculumSequenceItem[] = course.units.flatMap((unit, index) => {
    const done = unit.lessons.filter((lesson) => completed.has(`${course.id}/${unit.id}/${lesson.id}`)).length;
    const moduleItem: CurriculumSequenceItem = { type: "MODULE", id: unit.id, order: index * 10 + 1, title: unit.title, status: done === unit.lessons.length ? "COMPLETED" : "AVAILABLE", locked: false, progress: unit.lessons.length ? Math.round((done / unit.lessons.length) * 100) : 0, lessons: unit.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, type: lesson.type, href: lessonHref(course.slug, unit.id, lesson.id) })) };
    const projectItems = projects.filter((project) => project.insertAfterModule === index + 1).map((project) => {
      const status = snapshot ? projectStatus(project, course, completed, snapshot.minorProjectSubmissions?.[project.slug]) : "LOCKED";
      return { type: "PROJECT" as const, id: project.slug, order: index * 10 + 5, title: project.title, status, locked: status === "LOCKED", progress: status === "COMPLETED" ? 100 : status === "IN_PROGRESS" || status === "SUBMITTED" ? 50 : 0, prerequisiteUnitIds: project.prerequisiteUnitIds, project };
    });
    return [moduleItem, ...projectItems];
  });
  return { course: courseCatalogItem(course, snapshot), modules, projects, sequence };
}

export function validateCourseLearningCatalog(courses: Course[] = allCourses): string[] {
  const errors: string[] = [];
  const seenProjects = new Set<string>();
  for (const course of courses) {
    const projects = courseProjectsFor(course);
    if (projects.length !== 2) errors.push(`${course.slug}: expected exactly 2 projects, found ${projects.length}`);
    projects.forEach((project, index) => {
      const prefix = `${course.slug}/${project.slug}`;
      if (seenProjects.has(project.slug)) errors.push(`${prefix}: duplicate project slug`);
      seenProjects.add(project.slug);
      if (project.courseId !== course.id || project.courseSlug !== course.slug) errors.push(`${prefix}: invalid course relationship`);
      if (project.position !== index + 1) errors.push(`${prefix}: expected position ${index + 1}`);
      if (!Number.isInteger(project.insertAfterModule) || project.insertAfterModule < 1 || project.insertAfterModule > course.units.length) errors.push(`${prefix}: invalid curriculum position`);
      if (!project.prerequisiteUnitIds.length) errors.push(`${prefix}: missing prerequisites`);
      if (!project.prerequisiteUnitIds.every((unitId) => course.units.some((unit) => unit.id === unitId))) errors.push(`${prefix}: prerequisite module does not belong to course`);
      if (!project.assignment || !project.businessContext || !project.functionalRequirements.length || !project.nonFunctionalRequirements.length) errors.push(`${prefix}: missing project instructions or requirements`);
      if (!project.milestones.length || !project.technologies.length || !project.skills.length) errors.push(`${prefix}: missing milestones, technologies, or skills`);
      if (!project.relatedCourseSlugs?.includes(course.slug)) errors.push(`${prefix}: missing related course relationship`);
    });
  }
  return errors;
}

export function assertValidCourseLearningCatalog(courses: Course[] = allCourses) {
  const errors = validateCourseLearningCatalog(courses);
  if (errors.length) throw new Error(`Invalid course learning catalog:\n${errors.join("\n")}`);
}

export function findCourseForModule(courseSlugOrId: string) {
  return findCourseExact(courseSlugOrId) ?? null;
}

export function enrollmentForCourse(course: Course, snapshot: ProgressSnapshot): EnrollmentRecord | null {
  return snapshot.enrollments[course.id] ?? null;
}

export function projectStatusForCourse(project: CourseProject, course: Course, snapshot: ProgressSnapshot) {
  return projectStatus(project, course, completedLessonKeys(snapshot), snapshot.minorProjectSubmissions?.[project.slug]);
}

export type { CourseProject, CourseProjectStatus, Course, Unit };
