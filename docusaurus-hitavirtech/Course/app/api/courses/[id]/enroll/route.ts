import { getChatGPTUser } from "@/app/chatgpt-auth";
import { findCourseExact, lessonsForCourse } from "@/lib/course-data";
import { enrollment, readServerProgress, writeServerProgress } from "@/lib/server-course-progress";
import { privateHeaders } from "@/lib/http";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  const course = findCourseExact(id);
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  try {
    const snapshot = await readServerProgress(user.userId);
    const record = enrollment(course.id, snapshot);
    snapshot.enrollments[course.id] = record;
    const first = lessonsForCourse(course.slug)[0];
    snapshot.lastLesson ??= first ? { courseSlug: course.slug, unitId: first.unit.id, lessonId: first.lesson.id } : null;
    await writeServerProgress(user, snapshot);
    return Response.json({ ok: true, courseId: course.id, enrollment: record, nextLesson: first ? { unitId: first.unit.id, lessonId: first.lesson.id } : null }, { headers: privateHeaders });
  } catch {
    return Response.json({ error: "Course enrollment could not be saved" }, { status: 503 });
  }
}
