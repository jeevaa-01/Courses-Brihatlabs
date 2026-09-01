"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FolderKanban, LockKeyhole, Menu, Send } from "lucide-react";
import { findCourse, lessonHref } from "../lib/course-data";
import { courseProjectsFor, projectStatus } from "../lib/course-projects";
import type { ProjectWorkspace } from "../lib/project-workspace";
import { CourseLearningSidebar } from "./course-learning-sidebar";
import { Navbar } from "./navigation";
import { useProgress } from "./providers";

export function CourseProjectLearningPage({ courseSlug, projectSlug }: { courseSlug: string; projectSlug: string }) {
  const course = findCourse(courseSlug);
  const project = courseProjectsFor(course).find((item) => item.slug === projectSlug);
  const [drawer, setDrawer] = useState(false);
  const [notes, setNotes] = useState("");
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [repository, setRepository] = useState("");
  const [deployment, setDeployment] = useState("");
  const [message, setMessage] = useState("");
  const { completed, enrollCourse, minorProjectSubmissions, saveMinorProjectSubmission, viewerId } = useProgress();
  const completedKeys = useMemo(() => new Set(completed), [completed]);
  const saved = project ? minorProjectSubmissions[project.slug] : undefined;
  const status = project ? projectStatus(project, course, completedKeys, saved) : "LOCKED";
  const beforeUnit = project ? course.units[project.insertAfterModule - 1] : undefined;
  const afterUnit = project ? course.units[project.insertAfterModule] : undefined;
  const previous = beforeUnit?.lessons.at(-1);
  const next = afterUnit?.lessons[0];

  useEffect(() => {
    if (!project) return;
    enrollCourse(course.id);
    setNotes(saved?.notes || "");
    if (viewerId && viewerId !== "signed-out-preview") {
      void fetch(`/api/projects/${project.slug}`)
        .then((response) => response.ok ? response.json() as Promise<{ workspace?: ProjectWorkspace | null }> : null)
        .then((data) => {
          const workspace = data?.workspace;
          if (!workspace) return;
          setCompletedMilestones(workspace.milestones || []);
          setRepository(workspace.submission?.repository || "");
          setDeployment(workspace.submission?.deployment || "");
          setNotes(workspace.submission?.notes || saved?.notes || "");
        })
        .catch(() => undefined);
    }
  }, [course.id, enrollCourse, project, saved?.notes, viewerId]);

  if (!project) return null;

  const persistWorkspace = async () => {
    if (!viewerId || viewerId === "signed-out-preview") return true;
    const response = await fetch(`/api/projects/${project.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestones: completedMilestones, decisions: {}, submission: { repository: repository.trim(), deployment: deployment.trim(), notes: notes.trim() } }),
    });
    return response.ok;
  };

  const saveDraft = async (nextStatus: "in_progress" | "submitted") => {
    const now = new Date().toISOString();
    if (!await persistWorkspace()) {
      setMessage("Project workspace could not be saved.");
      return;
    }
    saveMinorProjectSubmission({ projectSlug: project.slug, courseId: course.id, status: nextStatus, notes: notes.trim(), updatedAt: now, submittedAt: nextStatus === "submitted" ? now : null });
    setMessage(nextStatus === "submitted" ? "Submission evidence saved. Complete the project when the required work is ready." : "Project notes saved.");
  };

  const completeProject = async () => {
    setMessage("Saving project completion…");
    const response = await fetch(`/api/projects/${project.slug}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestonesCompleted: completedMilestones, repository, deployment, notes }),
    });
    const data = await response.json() as { status?: string; error?: string; issues?: string[] };
    if (!response.ok || data.status !== "COMPLETED") {
      setMessage(data.issues?.join(" ") || data.error || "Project completion could not be saved.");
      return;
    }
    const now = new Date().toISOString();
    saveMinorProjectSubmission({ projectSlug: project.slug, courseId: course.id, status: "completed", notes: notes.trim(), updatedAt: now, submittedAt: saved?.submittedAt || now });
    setMessage("Project completed. Continue to the next module.");
  };

  const allMilestonesComplete = completedMilestones.length === project.milestones.length && project.milestones.every((milestone) => completedMilestones.includes(milestone.id));
  const hasEvidence = Boolean(repository.trim() || deployment.trim() || notes.trim().length >= 40);

  return <div className="lesson-page documentation-project-page"><Navbar compact />
    <button className="lesson-drawer-button" onClick={() => setDrawer(true)} aria-controls="course-navigation" aria-expanded={drawer}><Menu size={20} aria-hidden="true" /> Curriculum</button>
    <div className="lesson-layout"><CourseLearningSidebar course={course} active={{ kind: "project", projectSlug: project.slug }} drawer={drawer} onClose={() => setDrawer(false)} onNavigate={() => setDrawer(false)} />{drawer && <button className="drawer-backdrop" aria-label="Close course contents" onClick={() => setDrawer(false)} />}
      <main id="main-content" className="lesson-content project-doc-content"><nav className="lesson-breadcrumbs" aria-label="Breadcrumb"><Link href={`/courses/${course.slug}`}>{course.shortTitle}</Link><span>/</span><span>Project milestone {project.position}</span></nav>
        <header className="lesson-header"><div className="lesson-meta"><span>PROJECT MILESTONE {String(project.position).padStart(2, "0")}</span><span>{project.duration}</span></div><h1>{project.title}</h1><p>{project.summary}</p></header>
        {status === "LOCKED" ? <section className="project-doc-locked"><LockKeyhole size={24} aria-hidden="true" /><div><h2>Project locked</h2><p>Complete Modules 01–{project.insertAfterModule} before opening this applied milestone. The unlock is validated on the server.</p><Link className="button" href={lessonHref(course.slug, course.units[0].id, course.units[0].lessons[0].id)}>Return to course sequence <ArrowRight size={16} aria-hidden="true" /></Link></div></section> : <article className="lesson-article project-doc-article"><section><h2>Objective</h2><p>{project.assignment}</p></section><section><h2>Skills used</h2><div className="project-doc-tags">{project.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section><section><h2>Requirements</h2><div className="project-doc-grid"><div><h3>Functional</h3><ul>{project.functionalRequirements.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Quality and evidence</h3><ul>{project.nonFunctionalRequirements.map((item) => <li key={item}>{item}</li>)}</ul></div></div></section><section><h2>Project steps</h2><ol className="project-doc-steps">{project.milestones.map((milestone, index) => <li key={milestone.id}><label className="project-milestone-check"><input type="checkbox" checked={completedMilestones.includes(milestone.id)} onChange={(event) => setCompletedMilestones((current) => event.target.checked ? [...new Set([...current, milestone.id])] : current.filter((id) => id !== milestone.id))} disabled={status === "COMPLETED"} /><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{milestone.title}</h3><p>{milestone.objective}</p><strong>Deliverables</strong><ul>{milestone.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div></label></li>)}</ol></section><section className="project-doc-submission" aria-labelledby="project-submission-heading"><span className="eyebrow">SUBMISSION</span><h2 id="project-submission-heading">Save your project evidence</h2><p>Record a repository, notebook, deployment, or concise evidence summary. The full workspace remains available from the project detail route for deeper review and defense.</p><label htmlFor="embedded-project-repository">Repository URL<input id="embedded-project-repository" type="url" value={repository} onChange={(event) => setRepository(event.target.value)} placeholder="https://github.com/you/project" disabled={status === "COMPLETED"} /></label><label htmlFor="embedded-project-deployment">Deployment URL<input id="embedded-project-deployment" type="url" value={deployment} onChange={(event) => setDeployment(event.target.value)} placeholder="https://your-project.example.com" disabled={status === "COMPLETED"} /></label><label htmlFor="embedded-project-notes">Submission notes or portfolio link<textarea id="embedded-project-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} placeholder="Describe the implementation, link the artifact, and record validation evidence." disabled={status === "COMPLETED"} /></label><div className="project-actions">{status !== "COMPLETED" && <><button className="button button-secondary" type="button" onClick={() => void saveDraft("in_progress")}>Save draft</button><button className="button button-secondary" type="button" disabled={!notes.trim()} onClick={() => void saveDraft("submitted")}>Save submission <Send size={16} aria-hidden="true" /></button><button className="button" type="button" disabled={!allMilestonesComplete || !hasEvidence} onClick={() => void completeProject()}>Mark project complete <CheckCircle2 size={16} aria-hidden="true" /></button></>}{status === "COMPLETED" && <p className="project-success"><CheckCircle2 size={18} aria-hidden="true" /> Completed project evidence is saved.</p>}</div>{message && <p className="project-doc-message" role="status">{message}</p>}</section></article>}
        <nav className="lesson-actions" aria-label="Curriculum navigation"><div>{previous && beforeUnit ? <Link className="lesson-nav-link" href={lessonHref(course.slug, beforeUnit.id, previous.id)}><ArrowLeft size={19} aria-hidden="true" /><span><small>Previous lesson</small><strong>{previous.title}</strong></span></Link> : null}</div><div>{next && afterUnit ? <Link className="lesson-nav-link next-link" href={lessonHref(course.slug, afterUnit.id, next.id)}><span><small>Next lesson</small><strong>{next.title}</strong></span><ArrowRight size={19} aria-hidden="true" /></Link> : <Link className="lesson-nav-link next-link" href={`/courses/${course.slug}`}><span><small>Course completion</small><strong>Back to course</strong></span><ArrowRight size={19} aria-hidden="true" /></Link>}</div></nav>
      </main>
      <aside className="lesson-aside project-doc-aside" aria-label="Project summary"><div className="aside-card"><FolderKanban size={20} aria-hidden="true" /><span className="aside-label">PROJECT {String(project.position).padStart(2, "0")}</span><strong>{status === "COMPLETED" ? "Completed" : status === "SUBMITTED" ? "Evidence submitted" : "Applied milestone"}</strong><p>Placed after Module {String(project.insertAfterModule).padStart(2, "0")}.</p></div><div className="aside-card"><span className="aside-label">TECHNOLOGIES</span><p>{project.technologies.join(" · ")}</p></div></aside>
    </div>
  </div>;
}
