import { getChatGPTUser } from "@/app/chatgpt-auth";
import { allCourses } from "@/lib/course-data";
import { courseCatalogItem, courseEnrollmentStatus, nextLearningItem } from "@/lib/course-learning-module";
import { progressForCourse, readServerProgress } from "@/lib/server-course-progress";
import { privateHeaders } from "@/lib/http";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  try {
    const snapshot = await readServerProgress(user.userId);
    const courses = allCourses
      .filter((course) => courseEnrollmentStatus(course, snapshot) !== "NOT_ENROLLED")
      .map((course) => ({
        course: courseCatalogItem(course, snapshot),
        enrollment: snapshot.enrollments[course.id] ?? null,
        progress: progressForCourse(course, snapshot),
        next: nextLearningItem(course, snapshot),
      }));
    return Response.json({ enrollments: courses }, { headers: privateHeaders });
  } catch {
    return Response.json({ error: "Course enrollments are temporarily unavailable" }, { status: 503 });
  }
}
