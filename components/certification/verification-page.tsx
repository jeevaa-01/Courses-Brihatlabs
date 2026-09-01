"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";

type Verification = { credentialId: string; status: string; valid: boolean; recipientDisplayName: string; courseTitle: string; issuerName: string; issuerTitle: string | null; issuedAt: string | null };

export function VerificationPage({ credentialId }: { credentialId: string }) {
  const [data, setData] = useState<Verification | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "not-found" | "error">("loading");
  useEffect(() => { void fetch(`/api/certificates/${encodeURIComponent(credentialId)}/verify`, { cache: "no-store" }).then(async (response) => { if (response.status === 404) { setState("not-found"); return; } if (!response.ok) throw new Error("unavailable"); setData(await response.json() as Verification); setState("ready"); }).catch(() => setState("error")); }, [credentialId]);
  return <main className="verify-page section-shell"><span className="eyebrow">PUBLIC CREDENTIAL CHECK</span><h1>Certificate verification</h1>{state === "loading" && <div className="verify-card verify-loading" role="status"><LoaderCircle className="spin" size={24} aria-hidden="true" /> Checking credential…</div>}{state === "not-found" && <div className="verify-card verify-invalid"><CircleAlert size={28} aria-hidden="true" /><h2>Credential not found</h2><p>No public certificate record matches this credential ID.</p></div>}{state === "error" && <div className="verify-card verify-invalid"><CircleAlert size={28} aria-hidden="true" /><h2>Verification unavailable</h2><p>Try again later. No credential details were disclosed.</p></div>}{state === "ready" && data && <div className={`verify-card ${data.valid ? "verify-valid" : "verify-invalid"}`}><div className="verify-result-heading">{data.valid ? <CheckCircle2 size={29} aria-hidden="true" /> : <CircleAlert size={29} aria-hidden="true" />}<div><span className="eyebrow">{data.valid ? "VALID CREDENTIAL" : "REVOKED CREDENTIAL"}</span><h2>{data.courseTitle}</h2></div></div><dl><div><dt>Recipient</dt><dd>{data.recipientDisplayName}</dd></div><div><dt>Credential ID</dt><dd>{data.credentialId}</dd></div><div><dt>Issuer</dt><dd>{data.issuerName}{data.issuerTitle ? ` · ${data.issuerTitle}` : ""}</dd></div><div><dt>Issued</dt><dd>{data.issuedAt ? new Date(data.issuedAt).toLocaleDateString() : "Not issued"}</dd></div></dl></div>}<Link className="back-link" href="/courses">Browse courses</Link></main>;
}
