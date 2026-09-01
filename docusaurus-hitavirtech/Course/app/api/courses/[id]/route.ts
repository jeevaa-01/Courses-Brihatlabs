import { findCourseExact } from "@/lib/course-data";
import { courseCatalogItem } from "@/lib/course-learning-module";
import { publicCourseHeaders } from "@/lib/http";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const course = findCourseExact(id);
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  const includeContent = new URL(request.url).searchParams.get("include") === "content";
  const { units, ...courseMetadata } = course;
  const responseCourse = includeContent
    ? { ...courseMetadata, units, status: "published" as const }
    : courseCatalogItem(course);
  return Response.json({ course: responseCourse, curriculumUrl: `/api/courses/${course.id}/curriculum` }, { headers: publicCourseHeaders });
}
