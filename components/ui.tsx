"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

const codeTokenPattern = /(#[^\n]*|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b(?:and|as|async|await|break|case|catch|class|const|continue|def|do|else|except|export|extends|false|finally|for|from|function|if|import|in|interface|let|new|null|or|pass|raise|return|switch|throw|true|try|type|undefined|while|yield)\b)/g;

function highlightedCode(code: string) {
  return code.split(codeTokenPattern).map((token, index) => {
    if (!token) return null;
    let className = "";
    if (token.startsWith("#") || token.startsWith("//")) className = "token-comment";
    else if (/^["'`]/.test(token)) className = "token-string";
    else if (/^\d/.test(token)) className = "token-number";
    else if (/^[a-z]+$/i.test(token)) className = "token-keyword";
    return className ? <span className={className} key={`${index}-${token}`}>{token}</span> : token;
  });
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress-wrap" role="progressbar" aria-label={label ?? `${value}% complete`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
      <div className="progress-track"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
      {label && <span className="progress-label">{label}</span>}
    </div>
  );
}

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
  }, []);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="code-block">
      <div className="code-head"><span>{language}</span><button onClick={copy} aria-label="Copy code">{copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}{copied ? "Copied" : "Copy"}</button></div>
      <span className="sr-only" role="status" aria-live="polite">{copied ? "Code copied to clipboard" : ""}</span>
      <pre><code className={`language-${language}`}>{highlightedCode(code)}</code></pre>
    </div>
  );
}

export function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "brand" | "green" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}
