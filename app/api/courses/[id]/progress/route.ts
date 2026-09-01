import { getChatGPTUser } from "@/app/chatgpt-auth";
import { findCourseExact } from "@/lib/course-data";
import { courseEnrollmentStatus, nextLearningItem } from "@/lib/course-learning-module";
import { progressForCourse, readServerProgress } from "@/lib/server-course-progress";
import { privateHeaders } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  const course = findCourseExact(id);
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  try {
    const snapshot = await readServerProgress(user.userId);
    return Response.json({ courseId: course.id, status: courseEnrollmentStatus(course, snapshot), progress: progressForCourse(course, snapshot), next: nextLearningItem(course, snapshot) }, { headers: privateHeaders });
  } catch { return Response.json({ error: "Course progress is temporarily unavailable" }, { status: 503 }); }
}
