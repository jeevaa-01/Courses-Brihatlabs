import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { isLocalHost } from "../chatgpt-auth";

function safeReturnPath(value: string | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/dashboard";
  try {
    const url = new URL(value, "https://agentlab.local");
    return url.origin === "https://agentlab.local" ? `${url.pathname}${url.search}${url.hash}` : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export default async function LocalAuthPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const requestHeaders = await headers();
  if (!isLocalHost(requestHeaders.get("host"))) notFound();
  const query = await searchParams;
  const returnTo = safeReturnPath(query.return_to);
  const completeHref = `/local-auth/complete?return_to=${encodeURIComponent(returnTo)}`;
  return <main id="main-content" className="auth-page auth-chatgpt-page">
    <section className="auth-brand-panel" aria-label="About AgentLab"><Link className="brand brand-inverse" href="/"><span className="brand-mark" aria-hidden="true">A</span><span>AgentLab</span></Link><div><span className="auth-icon"><ShieldCheck size={30} aria-hidden="true" /></span><h1>Local enrollment<br />preview.</h1><p>The local Worker does not receive the ChatGPT identity headers that the hosted site provides.</p><ul><li><Check size={18} aria-hidden="true" /> Production authentication remains unchanged</li><li><Check size={18} aria-hidden="true" /> Local demo data is isolated from real accounts</li><li><Check size={18} aria-hidden="true" /> Return path is preserved safely</li></ul></div><small>LOCAL ONLY · AgentLab development preview</small></section>
    <section className="auth-form-panel" aria-labelledby="auth-heading"><div className="auth-form-wrap"><Link className="back-link" href="/">← Back to courses</Link><span className="auth-lock"><LockKeyhole size={24} aria-hidden="true" /></span><span className="eyebrow">LOCAL AUTHENTICATION</span><h2 id="auth-heading">Continue as a demo learner</h2><p>Start an isolated local session to test course enrollment, lessons, assigned projects, and progress.</p><Link className="button auth-submit" href={completeHref}>Start local demo session <ArrowRight size={18} aria-hidden="true" /></Link><p className="auth-privacy">Hosted deployment uses the existing ChatGPT identity bridge. Local demo data stays isolated from real accounts.</p></div></section>
  </main>;
}
