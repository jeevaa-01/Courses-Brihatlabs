import { getChatGPTUser } from "@/app/chatgpt-auth";
import { findCourseExact } from "@/lib/course-data";
import { getCertificationEligibility } from "@/lib/certification";
import { readCertificateIdentity, readCertificationRecord, readCertificationSettings } from "@/lib/server-certification";
import { readServerProgress } from "@/lib/server-course-progress";
import { privateHeaders } from "@/lib/http";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  const course = findCourseExact(id);
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  const idempotencyKey = request.headers.get("Idempotency-Key");
  if (!idempotencyKey || idempotencyKey.length > 200) return Response.json({ error: "An Idempotency-Key is required" }, { status: 400 });
  try {
    const [snapshot, settings, existing, identity] = await Promise.all([readServerProgress(user.userId), readCertificationSettings(course.id), readCertificationRecord(user.userId, course.id), readCertificateIdentity(user.userId, course.id)]);
    if (existing?.status === "ISSUED") return Response.json({ ok: true, certificate: { credentialId: existing.credentialId, status: existing.status, issuedAt: existing.issuedAt, verificationUrl: `/verify/${encodeURIComponent(existing.credentialId)}` }, idempotent: true }, { headers: privateHeaders });
    const certification = getCertificationEligibility(course, snapshot, settings, existing);
    if (certification.status === "ELIGIBLE_TEMPLATE_PENDING") return Response.json({ error: "Certification is eligible, but its certificate template is not configured", code: "TEMPLATE_PENDING", certification }, { status: 409, headers: privateHeaders });
    if (certification.status !== "READY_TO_GENERATE") return Response.json({ error: "Certification requirements are not complete", code: certification.reason, certification }, { status: 409, headers: privateHeaders });
    if (!identity) return Response.json({ error: "Confirm the certificate name before issuing", code: "IDENTITY_REQUIRED" }, { status: 409, headers: privateHeaders });
    return Response.json({ error: "Certificate generation is not enabled until a versioned renderer is registered", code: "RENDERER_NOT_CONFIGURED" }, { status: 501, headers: privateHeaders });
  } catch { return Response.json({ error: "Certificate issuance is temporarily unavailable" }, { status: 503 }); }
}
