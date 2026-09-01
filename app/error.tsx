"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="route-error" role="alert">
      <span><AlertTriangle size={28} /></span>
      <h1>We couldn’t load this page.</h1>
      <p>Your progress is safe. Try loading the page again.</p>
      <button className="button" onClick={reset}><RotateCcw size={18} /> Try again</button>
    </main>
  );
}
