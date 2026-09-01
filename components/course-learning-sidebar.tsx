"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Award, CheckCircle2, ChevronDown, Circle, FileQuestion, FolderKanban, LockKeyhole, Search, X } from "lucide-react";
import type { Course } from "../types/course";
import { courseProjectsFor, projectStatus } from "../lib/course-projects";
import { lessonHref, lessonsForCourse } from "../lib/course-data";
import { useProgress } from "./providers";
import { ProgressBar } from "./ui";

type ActiveItem = { kind: "lesson"; unitId: string; lessonId: string } | { kind: "project"; projectSlug: string } | { kind: "certification" };

export function CourseLearningSidebar({ course, active, drawer = false, onClose, onNavigate }: { course: Course; active: ActiveItem; drawer?: boolean; onClose?: () => void; onNavigate?: () => void }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const activeLessonRef = useRef<HTMLAnchorElement>(null);
  const [query, setQuery] = useState("");
  const [openUnits, setOpenUnits] = useState<string[]>(() => active.kind === "lesson" ? [active.unitId] : []);
  const { completed, isComplete, minorProjectSubmissions } = useProgress();
  const lessons = lessonsForCourse(course.slug);
  const completeLessons = lessons.filter(({ unit, lesson }) => isComplete(course.id, unit.id, lesson.id)).length;
  const completedKeys = useMemo(() => new Set(completed), [completed]);
  const projects = courseProjectsFor(course);
  const projectStates = projects.map((project) => projectStatus(project, course, completedKeys, minorProjectSubmissions[project.slug]));
  const completedProjects = projectStates.filter((status) => status === "COMPLETED").length;
  const progress = Math.round(((completeLessons + completedProjects) / Math.max(1, lessons.length + projects.length)) * 100);
  const normalized = query.trim().toLowerCase();
  const matches = (value: string) => !normalized || value.toLowerCase().includes(normalized);

  useEffect(() => {
    if (active.kind === "lesson") setOpenUnits((items) => Array.from(new Set([...items, active.unitId])));
    const frame = requestAnimationFrame(() => activeLessonRef.current?.scrollIntoView({ block: "nearest" }));
    return () => cancelAnimationFrame(frame);
  }, [active]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(`agentlab:course-sidebar:${course.id}`) || "[]");
      if (Array.isArray(saved)) setOpenUnits((items) => Array.from(new Set([...saved.filter((id): id is string => typeof id === "string"), ...items])));
    } catch {
      // A malformed saved preference should never prevent curriculum navigation.
    }
  }, [course.id]);

  useEffect(() => {
    window.sessionStorage.setItem(`agentlab:course-sidebar:${course.id}`, JSON.stringify(openUnits));
  }, [course.id, openUnits]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = () => { onNavigate?.(); onClose?.(); };
  return <aside id="course-navigation" className={`lesson-sidebar docs-sidebar ${drawer ? "drawer-open" : ""}`} aria-label="Course documentation" aria-modal={drawer || undefined} role={drawer ? "dialog" : undefined}>
    <div className="sidebar-mobile-head"><strong>Course curriculum</strong><button onClick={onClose} aria-label="Close course contents"><X size={22} aria-hidden="true"/></button></div>
    <div className="course-sidebar-title"><Link href={`/courses/${course.slug}`}>{course.shortTitle}</Link><span>{course.level} · Documentation learning mode</span></div>
    <div className="course-search"><Search size={16} aria-hidden="true"/><label className="sr-only" htmlFor="course-search">Search course documentation</label><input ref={searchRef} id="course-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search course"/><kbd>Ctrl K</kbd>{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear course search"><X size={15}/></button>}</div>
    <div className="sidebar-progress"><div><span>Course progress</span><strong>{progress}%</strong></div><ProgressBar value={progress} label={`${completeLessons} lessons and ${completedProjects} projects complete`}/></div>
    <nav className="unit-nav docs-unit-nav" aria-label="Course curriculum">{course.units.map((unit, unitIndex) => {
      const unitLessons = unit.lessons.filter((lesson) => matches(`${unit.title} ${unit.description} ${lesson.title} ${lesson.description}`));
      const unitMatches = unitLessons.length > 0 || matches(`${unit.title} ${unit.description}`);
      if (!unitMatches) return null;
      const open = normalized ? true : openUnits.includes(unit.id);
      const done = unit.lessons.filter((lesson) => isComplete(course.id, unit.id, lesson.id)).length;
      const linkedProjects = projects.map((project, index) => ({ project, status: projectStates[index] })).filter(({ project }) => project.insertAfterModule === unitIndex + 1 && (!normalized || matches(`${project.title} ${project.summary} ${project.skills.join(" ")}`)));
      return <div className="sidebar-unit" key={unit.id}><button type="button" onClick={() => setOpenUnits((items) => items.includes(unit.id) ? items.filter((id) => id !== unit.id) : [...items, unit.id])} aria-expanded={open} aria-controls={`${unit.id}-navigation`}><span>{unitIndex + 1}. MODULE</span><strong>{unit.title}</strong><small>{done} of {unit.lessons.length} complete</small><ChevronDown className={open ? "rotate" : ""} size={18} aria-hidden="true"/></button>{open && <div className="sidebar-lessons" id={`${unit.id}-navigation`}>{unitLessons.map((lesson) => { const activeLesson = active.kind === "lesson" && active.unitId === unit.id && active.lessonId === lesson.id; return <Link ref={activeLesson ? activeLessonRef : undefined} className={activeLesson ? "active" : ""} href={lessonHref(course.slug, unit.id, lesson.id)} key={lesson.id} onClick={navigate} aria-current={activeLesson ? "page" : undefined}>{isComplete(course.id, unit.id, lesson.id) ? <CheckCircle2 className="completed-icon" size={17} aria-label="Completed"/> : lesson.type === "quiz" ? <FileQuestion size={17} aria-label="Assessment"/> : <Circle size={15} aria-hidden="true"/>}<span>{lesson.type === "quiz" ? "Module assessment" : lesson.title}</span></Link>; })}</div>}{linkedProjects.map(({ project, status }) => <ProjectNavigationItem key={project.slug} course={course} project={project} status={status} active={active.kind === "project" && active.projectSlug === project.slug} onNavigate={navigate}/>)}</div>;
    })}{normalized && !course.units.some((unit) => matches(`${unit.title} ${unit.description} ${unit.lessons.map((lesson) => `${lesson.title} ${lesson.description}`).join(" ")}`)) && !projects.some((project) => matches(`${project.title} ${project.summary} ${project.skills.join(" ")}`)) && <p className="course-search-empty">No lessons or projects match “{query}”.</p>}<CertificationNavItem course={course} active={active.kind === "certification"} onNavigate={navigate}/></nav>
  </aside>;
}

function CertificationNavItem({ course, active, onNavigate }: { course: Course; active: boolean; onNavigate: () => void }) {
  const [label, setLabel] = useState("Complete 100% to unlock");
  useEffect(() => { let cancelled = false; void fetch(`/api/courses/${course.id}/certification/status`, { cache: "no-store" }).then((response) => response.ok ? response.json() as Promise<{ certification?: { status?: string } }> : null).then((data) => { if (cancelled || !data?.certification?.status) return; const status = data.certification.status; setLabel(status === "ISSUED" ? "Issued" : status === "ELIGIBLE_TEMPLATE_PENDING" ? "Eligible · template pending" : status === "READY_TO_GENERATE" ? "Ready to generate" : "Complete 100% to unlock"); }).catch(() => undefined); return () => { cancelled = true; }; }, [course.id]);
  return <Link className={`sidebar-certification ${active ? "active" : ""}`} href={`/courses/${course.slug}/certification`} onClick={onNavigate} aria-current={active ? "page" : undefined}><Award size={17} aria-hidden="true"/><span><strong>CERTIFICATION</strong><small>{label}</small></span></Link>;
}

function ProjectNavigationItem({ course, project, status, active, onNavigate }: { course: Course; project: ReturnType<typeof courseProjectsFor>[number]; status: string; active: boolean; onNavigate: () => void }) {
  const locked = status === "LOCKED";
  const content = <><span className="project-nav-label">PROJECT {String(project.position).padStart(2, "0")}</span><strong>{project.title}</strong><small>{locked ? `Complete Modules 01–${project.insertAfterModule} to unlock` : status === "COMPLETED" ? "Completed" : "Applied milestone"}</small></>;
  if (locked) return <div className="sidebar-project locked" title={`Complete Modules 01–${project.insertAfterModule} to unlock ${project.title}`}><LockKeyhole size={16} aria-hidden="true"/>{content}</div>;
  return <Link className={`sidebar-project ${active ? "active" : ""}`} href={`/learn/${course.slug}/project/${project.slug}`} onClick={onNavigate} aria-current={active ? "page" : undefined}><FolderKanban size={16} aria-hidden="true"/>{content}</Link>;
}
