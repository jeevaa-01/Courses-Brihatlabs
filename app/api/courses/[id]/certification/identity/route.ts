import { getChatGPTUser } from "@/app/chatgpt-auth";
import { findCourseExact } from "@/lib/course-data";
import { normalizeCertificateName } from "@/lib/certification";
import { readServerProgress } from "@/lib/server-course-progress";
import { saveCertificateIdentity } from "@/lib/server-certification";
import { privateHeaders } from "@/lib/http";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  const course = findCourseExact(id);
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  let body: { displayName?: unknown };
  try { body = await request.json() as { displayName?: unknown }; } catch { return Response.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
  const displayName = normalizeCertificateName(body.displayName);
  if (!displayName) return Response.json({ error: "Enter a name between 2 and 160 characters" }, { status: 400 });
  try {
    const snapshot = await readServerProgress(user.userId);
    if (!snapshot.enrollments[course.id]) return Response.json({ error: "Enroll in the course before confirming certificate identity" }, { status: 409 });
    const identity = await saveCertificateIdentity(user, course.id, displayName);
    return Response.json({ ok: true, identity }, { headers: privateHeaders });
  } catch { return Response.json({ error: "Certificate identity could not be saved" }, { status: 503 }); }
}
