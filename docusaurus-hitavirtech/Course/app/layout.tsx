import type { Metadata } from "next";
import "./globals.css";
import "./slider.css";
import { Providers } from "../components/providers";
import { getRequestOrigin } from "../lib/request-origin";
import { getChatGPTUser } from "./chatgpt-auth";

export async function generateMetadata(): Promise<Metadata> {
  const origin = await getRequestOrigin();
  const socialImage = new URL("/og.png", origin).toString();
  return {
    metadataBase: origin,
    title: { default: "AgentLab AI Learning — Learn practical AI", template: "%s · AgentLab" },
    description: "Structured, beginner-friendly courses for building practical software, data, machine-learning, and AI systems.",
    openGraph: {
      title: "AgentLab AI Learning — Learn practical AI",
      description: "Progress through focused lessons, accessible assessments, guided labs, and portfolio-ready projects.",
      type: "website",
      images: [{ url: socialImage, width: 1776, height: 888, alt: "AgentLab learning path through practical labs, missions, mastery, and verified evidence" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "AgentLab AI Learning — Learn practical AI",
      description: "Build practical systems through focused lessons, labs, assessments, and projects.",
      images: [socialImage],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getChatGPTUser();
  const viewer = user ? { id: user.userId, email: user.email, displayName: user.displayName } : null;
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var saved=localStorage.getItem('agentlab-theme');var dark=saved?saved==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=dark?'dark':'light'}catch(e){}})()` }}/></head><body><a className="skip-link" href="#main-content">Skip to main content</a><Providers viewer={viewer}>{children}</Providers></body></html>;
}
