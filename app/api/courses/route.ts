import { allCourses } from "@/lib/course-data";
import { courseProjectsFor } from "@/lib/course-projects";
import { publicCourseHeaders } from "@/lib/http";

function summary(course: (typeof allCourses)[number]) {
  const lessons = course.units.flatMap((unit) => unit.lessons);
  return { id: course.id, slug: course.slug, title: course.title, shortTitle: course.shortTitle, description: course.shortDescription, level: course.level, duration: course.duration, moduleCount: course.units.length, lessonCount: lessons.length, projectCount: courseProjectsFor(course).length, skills: course.tags, careerPath: course.careerPath, status: "published" as const };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const careerPath = url.searchParams.get("careerPath")?.trim().toLowerCase() ?? "";
  const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "100", 10) || 100));
  const courses = allCourses.map(summary).filter((course) => (!careerPath || course.careerPath.toLowerCase() === careerPath) && (!query || `${course.title} ${course.description} ${course.skills.join(" ")}`.toLowerCase().includes(query))).slice(0, limit);
  return Response.json({ courses, total: courses.length }, { headers: publicCourseHeaders });
}
