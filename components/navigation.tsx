"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, CloudOff, LoaderCircle, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useProgress } from "./providers";
import { GlobalSearch } from "./global-search";

const publicItems = [["Courses", "/courses"]] as const;
const learnerItems = [["Courses", "/courses"], ["My Learning", "/dashboard"]] as const;

export function Navbar({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const { retrySync, syncState, viewer } = useProgress();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navItems = viewer ? learnerItems : publicItems;

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); } };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("agentlab-theme", next ? "dark" : "light");
  };
  const isActive = (href: string) => href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href);

  return <header className={`navbar ${compact ? "navbar-compact" : ""}`}>
    <Link className="brand" href="/" aria-label="AgentLab home"><span className="brand-mark" aria-hidden="true">A</span><span>AgentLab</span></Link>
    <nav id="primary-navigation" className={`nav-links ${open ? "nav-open" : ""}`} aria-label="Main navigation">
      {navItems.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)} aria-current={isActive(href) ? "page" : undefined}>{label}</Link>)}
      {!viewer && <Link href="/login" onClick={() => setOpen(false)} aria-current={pathname === "/login" ? "page" : undefined}>Sign in</Link>}
    </nav>
    <div className="nav-actions">
      <GlobalSearch/>
      {viewer && syncState !== "idle" && <div className={`sync-indicator sync-${syncState}`} role="status" aria-live="polite">{syncState === "saving" ? <><LoaderCircle size={15} aria-hidden="true"/> Saving</> : syncState === "saved" ? <><Check size={15} aria-hidden="true"/> Saved</> : <button type="button" onClick={retrySync}><CloudOff size={15} aria-hidden="true"/> Save failed · Retry</button>}</div>}
      {viewer && <details className="user-menu"><summary aria-label="Open account menu"><span>{viewer.displayName.slice(0, 1).toUpperCase()}</span><small>{viewer.displayName}</small><ChevronDown size={16} aria-hidden="true" /></summary><div><strong>{viewer.displayName}</strong><small>{viewer.email}</small><Link href="/dashboard">My learning</Link><a href="/signout-with-chatgpt?return_to=%2F"><LogOut size={16} aria-hidden="true" /> Sign out</a></div></details>}
      <button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${dark ? "light" : "dark"} mode`} aria-pressed={dark}>{dark ? <Sun size={20} aria-hidden="true"/> : <Moon size={20} aria-hidden="true"/>}</button>
      <button ref={menuButton} className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-controls="primary-navigation" aria-expanded={open}>{open ? <X size={22} aria-hidden="true"/> : <Menu size={22} aria-hidden="true"/>}</button>
    </div>
  </header>;
}

export function Footer() {
  return <footer className="footer"><div><Link className="brand" href="/"><span className="brand-mark">A</span><span>AgentLab</span></Link><p>Courses, modules, lessons, assigned projects, progress, and completion.</p></div><div className="footer-links"><Link href="/courses">Courses</Link><Link href="/login">Sign in</Link></div><p className="copyright">© 2026 HitaVirTech · AgentLab AI Learning</p></footer>;
}
