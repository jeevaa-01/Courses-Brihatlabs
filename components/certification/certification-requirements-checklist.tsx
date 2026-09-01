import Link from "next/link";
import { Check, Circle } from "lucide-react";
import type { CertificationRequirement } from "@/lib/certification";

export function CertificationRequirementsChecklist({ requirements }: { requirements: CertificationRequirement[] }) {
  return <section className="cert-checklist" aria-labelledby="cert-checklist-heading"><h2 id="cert-checklist-heading">Requirements</h2><div>{requirements.map((item) => item.complete ? <div className="cert-requirement complete" key={item.id}><Check size={17} aria-hidden="true" /><span>{item.title}</span><small>Complete</small></div> : <Link className="cert-requirement" href={item.href} key={item.id}><Circle size={17} aria-hidden="true" /><span>{item.title}</span><small>{item.detail || "Open"}</small></Link>)}</div></section>;
}
