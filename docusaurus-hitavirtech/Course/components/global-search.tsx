"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpen, Layers3, Search, X } from "lucide-react";
import { allCourses, lessonHref } from "../lib/course-data";

type SearchResult = { key: string; type: "Course" | "Module" | "Lesson"; title: string; context: string; href: string };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); } };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", closeOnEscape); };
  }, [open]);
  const results = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const matches = (value: string) => terms.every((term) => value.toLowerCase().includes(term));
    const items: SearchResult[] = [];
    for (const course of allCourses) {
      const courseText = `${course.title} ${course.shortDescription} ${course.tags.join(" ")} ${course.outcomes.join(" ")}`;
      if (matches(courseText)) items.push({ key: `course:${course.id}`, type: "Course", title: course.shortTitle, context: course.careerPath, href: `/courses/${course.slug}` });
      for (const unit of course.units) {
        if (matches(`${unit.title} ${unit.description} ${courseText}`)) items.push({ key: `module:${course.id}:${unit.id}`, type: "Module", title: unit.title, context: course.shortTitle, href: `/courses/${course.slug}#${unit.id}` });
        for (const lesson of unit.lessons) if (matches(`${lesson.title} ${lesson.description} ${unit.title} ${course.tags.join(" ")}`)) items.push({ key: `lesson:${course.id}:${unit.id}:${lesson.id}`, type: "Lesson", title: lesson.title, context: `${course.shortTitle} · ${unit.title}`, href: lessonHref(course.slug, unit.id, lesson.id) });
      }
    }
    return items.slice(0, 12);
  }, [query]);
  const close = () => { setOpen(false); setQuery(""); };
  return <><button ref={triggerRef} className="icon-button global-search-trigger" onClick={() => setOpen(true)} aria-label="Search all courses and lessons"><Search size={20} aria-hidden="true"/></button>{open && <div className="global-search-layer" role="dialog" aria-modal="true" aria-labelledby="global-search-title"><button className="global-search-backdrop" aria-label="Close search" onClick={close}/><section className="global-search-panel"><header><div><Search size={21} aria-hidden="true"/><h2 id="global-search-title">Search AgentLab</h2></div><button className="icon-button" onClick={close} aria-label="Close search"><X size={21} aria-hidden="true"/></button></header><label htmlFor="global-search-input">Search courses, modules, lessons, concepts, or technologies</label><input ref={inputRef} id="global-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try React, Playwright, Docker, SQL…" autoComplete="off"/><div className="global-search-results" aria-live="polite">{!query.trim() ? <div className="search-hint"><BookOpen size={25} aria-hidden="true"/><p>Search across all published courses and every lesson.</p><span>Popular: React · Playwright · Docker · SQL · RAG</span></div> : results.length ? results.map((result) => <Link href={result.href} onClick={close} key={result.key}><span>{result.type === "Course" ? <BookOpen size={17} aria-hidden="true"/> : <Layers3 size={17} aria-hidden="true"/>}</span><div><small>{result.type} · {result.context}</small><strong>{result.title}</strong></div><ArrowRight size={17} aria-hidden="true"/></Link>) : <div className="search-hint"><Search size={25} aria-hidden="true"/><p>No matching learning content</p><span>Try a broader technology, concept, or role.</span></div>}</div></section></div>}</>;
}
