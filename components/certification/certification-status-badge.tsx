import { CheckCircle2, Clock3, LockKeyhole, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import type { CertificationStatus } from "@/lib/certification";

const labels: Record<CertificationStatus, string> = { LOCKED: "Locked", ELIGIBLE_TEMPLATE_PENDING: "Eligible · template pending", READY_TO_GENERATE: "Ready to generate", GENERATING: "Generating", ISSUED: "Issued", GENERATION_FAILED: "Generation failed", REVOKED: "Revoked" };

export function CertificationStatusBadge({ status }: { status: CertificationStatus }) {
  const Icon = status === "ISSUED" ? CheckCircle2 : status === "LOCKED" ? LockKeyhole : status === "REVOKED" || status === "GENERATION_FAILED" ? ShieldAlert : status === "GENERATING" ? RotateCcw : status === "ELIGIBLE_TEMPLATE_PENDING" ? Clock3 : Sparkles;
  return <span className={`cert-status cert-status-${status.toLowerCase()}`}><Icon size={15} aria-hidden="true" />{labels[status]}</span>;
}
