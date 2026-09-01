import { readPublicCertificate } from "@/lib/server-certification";

export async function GET(_request: Request, context: { params: Promise<{ credentialId: string }> }) {
  const { credentialId } = await context.params;
  if (!credentialId || credentialId.length > 100) return Response.json({ error: "Credential not found" }, { status: 404 });
  try {
    const certificate = await readPublicCertificate(credentialId);
    if (!certificate) return Response.json({ error: "Credential not found" }, { status: 404 });
    return Response.json(certificate, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch { return Response.json({ error: "Credential verification is temporarily unavailable" }, { status: 503 }); }
}
