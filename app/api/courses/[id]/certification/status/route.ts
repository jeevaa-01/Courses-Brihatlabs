import { getChatGPTUser } from "@/app/chatgpt-auth";
import { findCourseExact } from "@/lib/course-data";
import { getCertificationEligibility } from "@/lib/certification";
import { readCertificateIdentity, readCertificationRecord, readCertificationSettings } from "@/lib/server-certification";
import { readServerProgress } from "@/lib/server-course-progress";
import { privateHeaders } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  const course = findCourseExact(id);
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  try {
    const [snapshot, settings, record, identity] = await Promise.all([readServerProgress(user.userId), readCertificationSettings(course.id), readCertificationRecord(user.userId, course.id), readCertificateIdentity(user.userId, course.id)]);
    return Response.json({ courseId: course.id, courseSlug: course.slug, courseTitle: course.title, settings, certification: getCertificationEligibility(course, snapshot, settings, record), identity: identity ? { displayName: identity.displayName, confirmedAt: identity.confirmedAt } : null, certificate: record ? { credentialId: record.credentialId, status: record.status, issuedAt: record.issuedAt, verificationUrl: `/verify/${encodeURIComponent(record.credentialId)}` } : null }, { headers: privateHeaders });
  } catch {
    return Response.json({ error: "Certification status is temporarily unavailable" }, { status: 503 });
  }
}
