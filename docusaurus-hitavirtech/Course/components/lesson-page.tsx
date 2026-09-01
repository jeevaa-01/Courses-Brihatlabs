"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, Clock3, FileQuestion, Lightbulb, Menu, NotebookPen, RotateCcw, Trophy } from "lucide-react";
import { findLesson, lessonHref, lessonsForCourse } from "../lib/course-data";
import { courseProjectsFor, type CourseProject } from "../lib/course-projects";
import { lessonKey, readLessonScroll, writeLastLesson, writeLessonScroll, type LessonNote, type ProjectSubmission, type QuizDraft } from "../lib/progress";
import type { ContentBlock, QuizQuestion } from "../types/course";
import { Navbar } from "./navigation";
import { useProgress } from "./providers";
import { CodeBlock, ProgressBar } from "./ui";
import { Callout, ComparisonTable, FlowDiagram, FormulaCard } from "./learning-content";
import { CourseLearningSidebar } from "./course-learning-sidebar";

export function LessonPage() {
  const pathname = usePathname();
  const router = useRouter();
  const parts = pathname.split("/").filter(Boolean);
  const courseSlug = parts[1] || "data-analytics";
  const unitId = parts[2] || "module-1";
  const lessonId = parts[3] || "what-is-data-analytics";
  const [drawer, setDrawer] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { enrollCourse, isComplete, lessonNotes, projectSubmissions, quizDrafts, removeQuizDraft, saveLessonNote, saveProjectSubmission, saveQuizDraft, saveQuizScore, toggleLesson, viewerId } = useProgress();

  const current = findLesson(courseSlug, unitId, lessonId);
  const courseLessons = useMemo(() => lessonsForCourse(current.course.slug), [current.course.slug]);
  const upcomingProject = useMemo(() => courseProjectsFor(current.course.slug).find((project) => project.insertAfterModule >= Number(current.unit.id.split("-")[1])), [current.course.slug, current.unit.id]);
  const currentIndex = courseLessons.findIndex(({ unit, lesson }) => unit.id === current.unit.id && lesson.id === current.lesson.id);
  const previous = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const next = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;
  const unitDone = current.unit.lessons.filter((lesson) => isComplete(current.course.id, current.unit.id, lesson.id)).length;
  const unitPercent = Math.round((unitDone / current.unit.lessons.length) * 100);
  const complete = isComplete(current.course.id, current.unit.id, current.lesson.id);
  const currentKey = lessonKey(current.course.id, current.unit.id, current.lesson.id);
  const projectSubmitted = current.lesson.type !== "project" || projectSubmissions[currentKey]?.status === "submitted" || complete;
  const lessonHeadings = current.lesson.content.filter((block): block is Extract<ContentBlock, { type: "heading" }> => block.type === "heading");

  useEffect(() => {
    enrollCourse(current.course.id);
    writeLastLesson(viewerId, { courseSlug: current.course.slug, unitId, lessonId });
    setNavigating(false);
    const focusFrame = requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
    });
    if (next) router.prefetch(lessonHref(next.course.slug, next.unit.id, next.lesson.id));
    return () => cancelAnimationFrame(focusFrame);
  }, [pathname, lessonId, unitId, router, next, current.course.id, current.course.slug, enrollCourse, viewerId]);

  useEffect(() => {
    const restoredPosition = readLessonScroll(viewerId, current.course.id, current.unit.id, current.lesson.id);
    const restoreFrame = requestAnimationFrame(() => window.scrollTo({ top: restoredPosition, behavior: "auto" }));
    let scrollTimer: number | null = null;
    const savePosition = () => {
      if (scrollTimer !== null) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => writeLessonScroll(viewerId, current.course.id, current.unit.id, current.lesson.id, window.scrollY), 180);
    };
    window.addEventListener("scroll", savePosition, { passive: true });
    return () => {
      cancelAnimationFrame(restoreFrame);
      if (scrollTimer !== null) window.clearTimeout(scrollTimer);
      writeLessonScroll(viewerId, current.course.id, current.unit.id, current.lesson.id, window.scrollY);
      window.removeEventListener("scroll", savePosition);
    };
  }, [current.course.id, current.lesson.id, current.unit.id, viewerId]);

  useEffect(() => {
    if (!drawer) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [drawer]);

  const beginNavigation = () => {
    setNavigating(true);
    setDrawer(false);
  };

  const markComplete = () => {
    toggleLesson(current.course.id, current.unit.id, current.lesson.id, true);
    if (next) {
      setNavigating(true);
      startTransition(() => router.push(lessonHref(next.course.slug, next.unit.id, next.lesson.id)));
    }
  };

  return <div className={`lesson-page ${navigating || isPending ? "is-navigating" : ""}`}><Navbar compact/>
    <div className="route-progress" aria-hidden="true" />
    <div className="route-status sr-only" aria-live="polite">{navigating || isPending ? "Loading the next lesson" : ""}</div>
    <button className="lesson-drawer-button" onClick={() => setDrawer(true)} aria-controls="course-navigation" aria-expanded={drawer}><Menu size={20} aria-hidden="true"/> Course contents</button>
    <div className="lesson-layout">
      <CourseLearningSidebar course={current.course} active={{ kind: "lesson", unitId: current.unit.id, lessonId: current.lesson.id }} drawer={drawer} onClose={() => setDrawer(false)} onNavigate={beginNavigation}/>
      {drawer && <button className="drawer-backdrop" aria-label="Close course contents" onClick={() => setDrawer(false)}/>} 

      <main id="main-content" className="lesson-content">
        <nav className="lesson-breadcrumbs" aria-label="Breadcrumb"><Link href={`/courses/${current.course.slug}`}>{current.course.shortTitle}</Link><ChevronRight size={16} aria-hidden="true"/><span>{current.unit.title}</span><ChevronRight size={16} aria-hidden="true"/><span aria-current="page">{current.lesson.title}</span></nav>
        <header className="lesson-header"><div className="lesson-meta"><span>{current.lesson.type === "quiz" ? "MODULE QUIZ" : current.lesson.type === "project" ? "HANDS-ON PROJECT" : "LESSON"}</span><span><Clock3 size={16} aria-hidden="true"/>{current.lesson.duration}</span></div><h1 ref={headingRef} tabIndex={-1}>{current.lesson.title}</h1><p>{current.lesson.description}</p><div className="mobile-unit-progress"><span>Module progress: {unitDone} of {current.unit.lessons.length}</span><ProgressBar value={unitPercent}/></div></header>
        {current.lesson.type === "quiz" && current.lesson.questions ? <Quiz questions={current.lesson.questions} initialDraft={quizDrafts[currentKey]} continueHref={next ? lessonHref(next.course.slug, next.unit.id, next.lesson.id) : `/courses/${current.course.slug}`} onDraft={(answers, questionIndex) => saveQuizDraft({ courseId: current.course.id, unitId: current.unit.id, lessonId: current.lesson.id, answers, questionIndex, updatedAt: new Date().toISOString() })} onClearDraft={() => removeQuizDraft(current.course.id, current.unit.id, current.lesson.id)} onPassed={() => toggleLesson(current.course.id, current.unit.id, current.lesson.id, true)} onFinished={(score, total, answers) => { saveQuizScore({ courseId: current.course.id, unitId: current.unit.id, lessonId: current.lesson.id, score, total, answers, percentage: Math.round((score / total) * 100), updatedAt: new Date().toISOString() }); removeQuizDraft(current.course.id, current.unit.id, current.lesson.id); }}/> : <><LessonRenderer blocks={current.lesson.content}/>{upcomingProject && <ProjectConnection project={upcomingProject}/>} {current.lesson.type === "project" && <ProjectSubmissionPanel existing={projectSubmissions[currentKey]} courseId={current.course.id} unitId={current.unit.id} lessonId={current.lesson.id} title={current.lesson.title} skills={current.course.tags.slice(0,4)} onSave={saveProjectSubmission}/>}</>}
        <LessonNotes existing={lessonNotes[currentKey]} courseId={current.course.id} unitId={current.unit.id} lessonId={current.lesson.id} onSave={saveLessonNote}/>
        <nav className="lesson-actions" aria-label="Lesson navigation"><div>{previous ? <Link className="lesson-nav-link" href={lessonHref(previous.course.slug, previous.unit.id, previous.lesson.id)} onClick={beginNavigation}><ArrowLeft size={19} aria-hidden="true"/><span><small>Previous lesson</small><strong>{previous.lesson.title}</strong></span></Link> : <span/>}</div><button className={`button complete-button ${complete ? "is-complete" : ""}`} onClick={markComplete} disabled={isPending || !projectSubmitted}>{complete ? <Check size={19} aria-hidden="true"/> : null}{!projectSubmitted ? "Submit project first" : isPending ? "Opening next lesson…" : complete ? "Completed" : next ? "Complete & continue" : "Mark as complete"}</button><div>{next ? <Link className="lesson-nav-link next-link" href={lessonHref(next.course.slug, next.unit.id, next.lesson.id)} onClick={beginNavigation}><span><small>Next lesson</small><strong>{next.lesson.title}</strong></span><ArrowRight size={19} aria-hidden="true"/></Link> : <span/>}</div></nav>
      </main>

      <aside className="lesson-aside" aria-label="Lesson progress and contents"><div className="aside-card"><span className="aside-label">MODULE PROGRESS</span><div className="aside-value"><strong>{unitDone}/{current.unit.lessons.length}</strong><span>{unitPercent}%</span></div><ProgressBar value={unitPercent} label={`${unitDone} of ${current.unit.lessons.length} lessons completed`}/><p>{current.unit.title}</p></div>{lessonHeadings.length > 0 && <nav className="aside-card on-this-page" aria-label="On this page"><span className="aside-label">IN THIS LESSON</span>{lessonHeadings.map((block, index) => <a href={`#section-${index}`} key={`${block.type}-${index}`}>{block.text}</a>)}</nav>}<div className="aside-tip"><Lightbulb size={20} aria-hidden="true"/><p><strong>Learning tip</strong>Explain the concept in your own words before moving on.</p></div></aside>
    </div>
  </div>;
}

function ProjectConnection({ project }: { project: CourseProject }) {
  return <aside className="lesson-project-connection" aria-label={`Used in project ${project.position}`}><span>USED IN PROJECT {String(project.position).padStart(2, "0")}</span><div><strong>{project.title}</strong><p>You&apos;ll apply this concept in the project&apos;s practical workflow: {project.summary}</p></div></aside>;
}

function LessonRenderer({ blocks }: { blocks: ContentBlock[] }) {
  let headingIndex = -1;
  return <article className="lesson-article">{blocks.map((block, index) => {
    if (block.type === "heading") { headingIndex += 1; return <h2 id={`section-${headingIndex}`} key={index}>{block.text}</h2>; }
    if (block.type === "paragraph") return <p key={index}>{block.text}</p>;
    if (block.type === "list") return <ul key={index}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
    if (block.type === "callout") return <Callout title={block.title} text={block.text} tone={block.tone} key={index}/>;
    if (block.type === "code") return <CodeBlock code={block.code} language={block.language} key={index}/>;
    if (block.type === "image") return <figure className="lesson-figure" key={index}><Image src={block.src} alt={block.alt} width={block.width ?? 1200} height={block.height ?? 675} sizes="(max-width: 900px) 100vw, 720px" loading="lazy"/>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
    if (block.type === "diagram") return <FlowDiagram items={block.items} variant={block.variant} key={index}/>;
    if (block.type === "formula") return <FormulaCard expression={block.expression} explanation={block.explanation} key={index}/>;
    if (block.type === "table") return <ComparisonTable headers={block.headers} rows={block.rows} key={index}/>;
    if (block.type === "resource") return <aside className="learn-more" key={index}><strong>Learn More</strong><a href={block.url} target="_blank" rel="noreferrer">{block.title}<ArrowRight size={16} aria-hidden="true"/></a><p>{block.description}</p></aside>;
    if (block.type === "video") return block.url ? <div className="video-wrap" key={index}><iframe src={block.url} title={block.title} loading="lazy" allowFullScreen/></div> : <div className="video-placeholder" key={index}><BookOpen size={24} aria-hidden="true"/><span>{block.title}</span></div>;
    return null;
  })}</article>;
}

function LessonNotes({ existing, courseId, unitId, lessonId, onSave }: { existing?: LessonNote; courseId: string; unitId: string; lessonId: string; onSave: (note: LessonNote) => void }) {
  const [text, setText] = useState(existing?.text || "");
  const [status, setStatus] = useState<"saved" | "editing">("saved");

  useEffect(() => {
    setText(existing?.text || "");
    setStatus("saved");
  }, [courseId, existing?.text, lessonId, unitId]);

  useEffect(() => {
    if (text === (existing?.text || "")) return;
    setStatus("editing");
    const timer = window.setTimeout(() => {
      onSave({ courseId, unitId, lessonId, text, updatedAt: new Date().toISOString() });
      setStatus("saved");
    }, 650);
    return () => window.clearTimeout(timer);
  }, [courseId, existing?.text, lessonId, onSave, text, unitId]);

  return <section className="lesson-notes" aria-labelledby="lesson-notes-heading"><div><span><NotebookPen size={20} aria-hidden="true"/></span><div><h2 id="lesson-notes-heading">Lesson notes</h2><p>Record an idea, question, or example to revisit later.</p></div><small role="status" aria-live="polite">{status === "editing" ? "Saving…" : text ? "Saved automatically" : "Optional"}</small></div><label className="sr-only" htmlFor="lesson-note-text">Notes for this lesson</label><textarea id="lesson-note-text" value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a short note…" rows={4} maxLength={20_000}/></section>;
}

function ProjectSubmissionPanel({ existing, courseId, unitId, lessonId, title, skills, onSave }: { existing?: ProjectSubmission; courseId: string; unitId: string; lessonId: string; title: string; skills: string[]; onSave: (submission: ProjectSubmission) => void }) {
  const [notes, setNotes] = useState(existing?.notes || "");
  const [confirming, setConfirming] = useState(false);
  const submitted = existing?.status === "submitted";
  const persist = (status: ProjectSubmission["status"]) => onSave({ courseId, unitId, lessonId, notes: notes.trim(), status, updatedAt: new Date().toISOString(), submittedAt: status === "submitted" ? existing?.submittedAt || new Date().toISOString() : null });
  return <section className="project-submission" aria-labelledby="project-submission-heading"><span className="eyebrow">PROJECT MILESTONE</span><h2 id="project-submission-heading">Submit your {title} milestone</h2><div className="project-brief"><article><strong>Problem statement</strong><p>Apply this lesson to a small, clearly defined problem and document the evidence behind your decisions.</p></article><article><strong>Required skills</strong><p>{skills.join(" · ")}</p></article><article><strong>Deliverables</strong><ul><li>A reproducible notebook, query, dashboard, or implementation</li><li>A short explanation of inputs, decisions, and output</li><li>One validation check and one limitation</li></ul></article><article><strong>Evaluation criteria</strong><ul><li>Correctness and reproducibility</li><li>Clear reasoning and appropriate validation</li><li>Useful communication of the result</li></ul></article></div><label htmlFor="project-notes">Submission notes or portfolio link</label><textarea id="project-notes" value={notes} onChange={(event) => setNotes(event.target.value)} disabled={submitted} placeholder="Summarize your deliverable, paste a repository link, or record what remains to finish." rows={5}/>{submitted ? <div className="project-success" role="status"><CheckCircle2 size={20} aria-hidden="true"/><div><strong>Milestone submitted</strong><p>Your submission is saved. You can now mark this project lesson complete.</p></div></div> : confirming ? <div className="submission-confirm" role="alert"><p>Submit this milestone now? You won’t create a duplicate submission.</p><div><button className="button" type="button" onClick={() => { persist("submitted"); setConfirming(false); }}>Confirm submission</button><button className="button button-secondary" type="button" onClick={() => setConfirming(false)}>Cancel</button></div></div> : <div className="project-actions"><button className="button button-secondary" type="button" onClick={() => persist("draft")}>Save draft</button><button className="button" type="button" disabled={!notes.trim()} onClick={() => setConfirming(true)}>Submit milestone</button></div>}</section>;
}

function Quiz({ questions, initialDraft, continueHref, onDraft, onClearDraft, onPassed, onFinished }: { questions: QuizQuestion[]; initialDraft?: QuizDraft; continueHref: string; onDraft: (answers: Record<string, number>, questionIndex: number) => void; onClearDraft: () => void; onPassed: () => void; onFinished: (score: number, total: number, answers: Record<string, number>) => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>(initialDraft?.answers || {});
  const [submitted, setSubmitted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(Math.min(initialDraft?.questionIndex || 0, questions.length - 1));
  const [revealed, setRevealed] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const score = useMemo(() => questions.filter((question) => answers[question.id] === question.answer).length, [answers, questions]);
  const question = questions[questionIndex];
  const selected = answers[question.id];
  const finish = () => {
    onFinished(score, questions.length, answers);
    if (score / questions.length >= 0.6) onPassed();
    setSubmitted(true);
    requestAnimationFrame(() => resultRef.current?.focus());
  };
  const retry = () => { setAnswers({}); setSubmitted(false); setQuestionIndex(0); setRevealed(false); onClearDraft(); };
  const nextQuestion = () => { if (questionIndex === questions.length - 1) finish(); else { const nextIndex = questionIndex + 1; setQuestionIndex(nextIndex); setRevealed(false); onDraft(answers, nextIndex); } };
  if (submitted) return <section ref={resultRef} tabIndex={-1} className="quiz-results" aria-live="polite"><span className="result-icon"><Trophy size={34} aria-hidden="true"/></span><span className="eyebrow">QUIZ COMPLETE</span><h2>{score}/{questions.length} · {Math.round((score / questions.length) * 100)}%</h2><p>{score === questions.length ? "Perfect score — you have a strong grasp of this module." : score / questions.length >= 0.6 ? "Nice work. Review the explanations before moving on." : "Almost there. Review the module and try once more."}</p><div className="answer-review">{questions.map((item, index) => { const correct = answers[item.id] === item.answer; return <article className={correct ? "answer-correct" : "answer-incorrect"} key={item.id}><strong>{correct ? "Correct" : "Review"}: Question {index + 1}</strong><p>{item.explanation}</p></article>; })}</div><div className="quiz-result-actions"><button className="button button-secondary" onClick={retry}><RotateCcw size={18} aria-hidden="true"/> Retry quiz</button><Link className="button" href={continueHref}>Continue <ArrowRight size={18} aria-hidden="true"/></Link></div></section>;
  return <section className="quiz"><div className="quiz-intro"><span><FileQuestion size={22} aria-hidden="true"/></span><div><span className="quiz-counter">Question {questionIndex + 1} / {questions.length}</span><h2>Check your understanding</h2><p>Choose one answer, submit it, and use the explanation before continuing. Answers save automatically.</p></div></div><ProgressBar value={((questionIndex + (revealed ? 1 : 0)) / questions.length) * 100} label={`${questionIndex + 1} of ${questions.length} questions`}/><fieldset className="question-card"><legend><span>{questionIndex + 1}</span>{question.prompt}</legend><div className="option-list">{question.options.map((option, optionIndex) => { const isSelected = selected === optionIndex; return <label className={isSelected ? "selected" : ""} key={option}><input type="radio" name={question.id} checked={isSelected} disabled={revealed} onChange={() => { const nextAnswers = { ...answers, [question.id]: optionIndex }; setAnswers(nextAnswers); onDraft(nextAnswers, questionIndex); }}/><span>{String.fromCharCode(65 + optionIndex)}</span><strong>{option}</strong></label>; })}</div></fieldset>{revealed && <div className={`quiz-feedback ${selected === question.answer ? "is-correct" : "is-incorrect"}`} role="status"><strong>{selected === question.answer ? "✓ Correct!" : "Not quite yet."}</strong><p>{question.explanation}</p></div>}<button className="button" disabled={selected === undefined} onClick={revealed ? nextQuestion : () => setRevealed(true)}>{revealed ? questionIndex === questions.length - 1 ? "See results" : "Next question" : "Submit answer"} <ArrowRight size={18} aria-hidden="true"/></button></section>;
}
