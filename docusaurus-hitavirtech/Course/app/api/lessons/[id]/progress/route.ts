import { getChatGPTUser } from "@/app/chatgpt-auth";
import { findCourseExact } from "@/lib/course-data";
import { progressForCourse, readServerProgress, upsertLessonProgress, writeServerProgress } from "@/lib/server-course-progress";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  const { id: lessonId } = await context.params;
  let body: { courseId?: string; unitId?: string; completed?: boolean };
  try { body = await request.json() as { courseId?: string; unitId?: string; completed?: boolean }; } catch { return Response.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
  if (!body.courseId || !body.unitId || typeof body.completed !== "boolean") return Response.json({ error: "courseId, unitId, and completed are required" }, { status: 400 });
  const course = findCourseExact(body.courseId);
  const lesson = course?.units.find((unit) => unit.id === body.unitId)?.lessons.find((item) => item.id === lessonId);
  if (!course || !lesson) return Response.json({ error: "Lesson not found" }, { status: 404 });
  try {
    const snapshot = await readServerProgress(user.userId);
    upsertLessonProgress(snapshot, course.id, body.unitId, lessonId, body.completed, user.userId);
    snapshot.lastLesson = { courseSlug: course.slug, unitId: body.unitId, lessonId };
    await writeServerProgress(user, snapshot);
    return Response.json({ ok: true, courseId: course.id, lessonId, completed: body.completed, progress: progressForCourse(course, snapshot) });
  } catch {
    return Response.json({ error: "Lesson progress could not be saved" }, { status: 503 });
  }
}
