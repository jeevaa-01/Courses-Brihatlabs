import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import { ProgressBar } from "@/components/ui";
import type { CertificationEligibility } from "@/lib/certification";

export function CertificationProgressCard({ certification }: { certification: CertificationEligibility }) {
  return <section className="cert-progress-card" aria-labelledby="cert-progress-heading"><div className="cert-progress-icon"><ListChecks size={24} aria-hidden="true" /></div><div className="cert-progress-copy"><h2 id="cert-progress-heading">Certification progress</h2><p>Complete every required lesson, pass each module assessment, and finish both assigned projects.</p><ProgressBar value={certification.percentage} label={`${certification.completedRequiredItems} of ${certification.totalRequiredItems} required items complete`} /><div className="cert-progress-breakdown"><span><CheckCircle2 size={16} aria-hidden="true" /> {certification.completedLessons} of {certification.requiredLessons} lessons</span><span><Circle size={16} aria-hidden="true" /> {certification.completedProjects} of {certification.requiredProjects} projects</span><span><Circle size={16} aria-hidden="true" /> {certification.passedAssessments} of {certification.requiredAssessments} assessments passed</span></div></div><strong className="cert-percentage">{certification.percentage}%</strong></section>;
}
