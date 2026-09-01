"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import type { CertificationEligibility, CertificationStatus } from "@/lib/certification";
import { CertificationProgressCard } from "./certification-progress-card";
import { CertificationRequirementsChecklist } from "./certification-requirements-checklist";
import { CertificatePreviewPlaceholder } from "./certificate-preview-placeholder";
import { CertificationStatusBadge } from "./certification-status-badge";

type StatusPayload = { courseId: string; courseSlug: string; courseTitle: string; settings: { issuerName: string; templateId: string | null }; certification: CertificationEligibility; identity: { displayName: string; confirmedAt: string } | null; certificate: { credentialId: string; status: CertificationStatus; issuedAt: string | null; verificationUrl: string } | null };

export function CertificationPage({ courseId, courseSlug, courseTitle, suggestedName }: { courseId: string; courseSlug: string; courseTitle: string; suggestedName: string }) {
  const [payload, setPayload] = useState<StatusPayload | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState(suggestedName);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const refresh = useCallback(async () => {
    setError("");
    try { const response = await fetch(`/api/courses/${courseId}/certification/status`, { cache: "no-store" }); const data = await response.json() as StatusPayload & { error?: string }; if (!response.ok) throw new Error(data.error || "Certification status is unavailable"); setPayload(data); if (data.identity) setName(data.identity.displayName); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Certification status is unavailable"); }
  }, [courseId]);
  useEffect(() => { void refresh(); }, [refresh]);

  const confirmIdentity = async () => {
    setSaving(true); setMessage("");
    try { const response = await fetch(`/api/courses/${courseId}/certification/identity`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: name }) }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error || "Identity could not be saved"); setMessage("Name confirmed for this certificate."); await refresh(); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Identity could not be saved"); }
    finally { setSaving(false); }
  };
  const issue = async () => {
    setIssuing(true); setMessage("");
    try { const response = await fetch(`/api/courses/${courseId}/certification/issue`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error || "Certificate could not be issued"); await refresh(); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Certificate could not be issued"); }
    finally { setIssuing(false); }
  };

  if (error) return <div className="cert-page section-shell"><Link className="back-link" href={`/courses/${courseSlug}`}><ArrowLeft size={17} aria-hidden="true" /> Back to course</Link><div className="cert-error"><ShieldCheck size={28} aria-hidden="true" /><h1>Certification is temporarily unavailable</h1><p>{error}. Your learning progress is unchanged.</p><button className="button" type="button" onClick={() => void refresh()}>Try again</button></div></div>;
  if (!payload) return <div className="cert-page section-shell"><div className="cert-loading" role="status"><LoaderCircle className="spin" size={26} aria-hidden="true" /> Loading certification status…</div></div>;
  const { certification, certificate } = payload;
  const issued = certification.status === "ISSUED" && certificate !== null;
  return <div className="cert-page section-shell"><Link className="back-link" href={`/courses/${courseSlug}`}><ArrowLeft size={17} aria-hidden="true" /> Back to course</Link><header className="cert-hero"><div><span className="eyebrow">FINAL COURSE MILESTONE</span><h1>{courseTitle} certification</h1><p>One clear finish line: prove the complete learning workflow with every lesson, assessment, and assigned project.</p></div><CertificationStatusBadge status={certification.status} /></header><CertificationProgressCard certification={certification} />{issued && certificate ? <section className="cert-issued"><BadgeCheck size={31} aria-hidden="true" /><div><span className="eyebrow">CREDENTIAL ISSUED</span><h2>Congratulations, {payload.identity?.displayName || "learner"}.</h2><p>Your credential ID is <strong>{certificate.credentialId}</strong>. Public verification is available from the link below.</p><Link className="button" href={certificate.verificationUrl}>Open verification <ArrowRight size={17} aria-hidden="true" /></Link></div></section> : <><CertificatePreviewPlaceholder enabled={certification.status === "READY_TO_GENERATE"} />{certification.status === "LOCKED" ? <CertificationRequirementsChecklist requirements={certification.missingRequirements} /> : certification.status === "ELIGIBLE_TEMPLATE_PENDING" ? <section className="cert-next-step"><CheckCircle2 size={24} aria-hidden="true" /><div><h2>Eligibility confirmed</h2><p>You have completed every required item. The final certificate template still needs to be connected by the platform administrator.</p></div></section> : <section className="cert-next-step"><BadgeCheck size={24} aria-hidden="true" /><div><h2>Confirm your certificate name</h2><p>Use the name exactly as you want it shown on the credential. It is stored server-side for this course.</p><label htmlFor="certificate-name">Certificate name</label><input id="certificate-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={160} autoComplete="name" /><div className="cert-actions"><button className="button button-secondary" type="button" onClick={() => void confirmIdentity()} disabled={saving || !name.trim()}>{saving ? "Saving…" : payload.identity ? "Update name" : "Confirm name"}</button>{certification.status === "READY_TO_GENERATE" && <button className="button" type="button" onClick={() => void issue()} disabled={issuing || !payload.identity}>{issuing ? "Preparing…" : "Generate certificate"}</button>}</div></div></section>}{message && <p className="cert-message" role="status">{message}</p>}</>}</div>;
}
