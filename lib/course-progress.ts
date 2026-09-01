import type { Course } from "@/types/course";
import { courseProjectsFor, projectStatus } from "@/lib/course-projects";
import type { ProgressSnapshot } from "@/lib/progress";

/** Pure course progress calculations shared by API handlers and the portable module. */
export function progressForCourse(course: Course, snapshot: ProgressSnapshot) {
  const records = new Map(snapshot.progressRecords.filter((record) => record.courseId === course.id).map((record) => [`${record.unitId}/${record.lessonId}`, record]));
  const lessons = course.units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })));
  const completedLessons = lessons.filter(({ unit, lesson }) => records.get(`${unit.id}/${lesson.id}`)?.completed).length;
  const minorProjects = courseProjectsFor(course);
  const completedKeys = new Set(snapshot.progressRecords.filter((record) => record.completed).map((record) => `${record.courseId}/${record.unitId}/${record.lessonId}`));
  const completedMinorProjects = minorProjects.filter((project) => projectStatus(project, course, completedKeys, snapshot.minorProjectSubmissions?.[project.slug]) === "COMPLETED").length;
  const lessonPercentage = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0;
  return {
    completedLessons,
    totalLessons: lessons.length,
    completedMinorProjects,
    totalMinorProjects: minorProjects.length,
    percentage: Math.round(lessonPercentage * 0.8 + (completedMinorProjects / Math.max(1, minorProjects.length)) * 20),
    complete: lessons.length > 0 && completedLessons === lessons.length && completedMinorProjects === minorProjects.length,
  };
}
