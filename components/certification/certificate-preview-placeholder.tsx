import { Award, LockKeyhole } from "lucide-react";

export function CertificatePreviewPlaceholder({ enabled = false }: { enabled?: boolean }) {
  return <section className={`certificate-preview ${enabled ? "is-enabled" : "is-locked"}`} aria-label="Certificate preview"><div className="certificate-preview-mark"><Award size={36} aria-hidden="true" /></div><div><span className="eyebrow">CERTIFICATE PREVIEW</span><h2>{enabled ? "Your certificate is ready to prepare" : "Certificate design will appear here"}</h2><p>{enabled ? "A versioned template will render the final credential after identity confirmation." : "The course is eligible only after all requirements are complete. Final artwork is supplied by the integrating platform."}</p></div>{!enabled && <LockKeyhole size={20} aria-label="Preview locked" />}</section>;
}
