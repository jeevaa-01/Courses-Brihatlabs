import { getChatGPTUser } from "@/app/chatgpt-auth";
import { findCourseExact } from "@/lib/course-data";
import { courseCurriculum } from "@/lib/course-learning-module";
import { readServerProgress } from "@/lib/server-course-progress";
import { publicCourseHeaders, privateHeaders } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const course = findCourseExact(id);
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  try {
    const user = await getChatGPTUser();
    const snapshot = user ? await readServerProgress(user.userId) : undefined;
    return Response.json(courseCurriculum(course, snapshot), { headers: user ? { ...privateHeaders, Vary: "oai-authenticated-user-id" } : publicCourseHeaders });
  } catch {
    return Response.json({ error: "Course curriculum is temporarily unavailable" }, { status: 503 });
  }
}
