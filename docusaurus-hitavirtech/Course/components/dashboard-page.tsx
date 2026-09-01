"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BookOpen, CheckCircle2, FolderKanban } from "lucide-react";
import { allCourses, lessonHref, lessonsForCourse } from "../lib/course-data";
import { courseProjectsFor, projectStatus } from "../lib/course-projects";
import { Navbar } from "./navigation";
import { useProgress } from "./providers";
import { ProgressBar } from "./ui";

export function DashboardPage() {
  const { completed, enrollments, isComplete, minorProjectSubmissions, progressRecords, ready, viewer } = useProgress();
  const progress = useMemo(() => allCourses.map((course) => {
    const lessons = lessonsForCourse(course.slug);
    const done = lessons.filter(({ unit, lesson }) => isComplete(course.id, unit.id, lesson.id));
    const projects = courseProjectsFor(course);
    const completedKeys = new Set(done.map(({ unit, lesson }) => `${course.id}/${unit.id}/${lesson.id}`));
    const completedProjects = projects.filter((project) => projectStatus(project, course, completedKeys, minorProjectSubmissions[project.slug]) === "COMPLETED").length;
    const percentage = Math.min(100, Math.round((done.length / lessons.length) * 80 + (completedProjects / projects.length) * 20));
    const current = lessons.find(({ unit, lesson }) => !isComplete(course.id, unit.id, lesson.id)) ?? lessons.at(-1)!;
    return { course, lessons, done, current, percentage, completedProjects, projectCount: projects.length };
  }), [isComplete, minorProjectSubmissions]);
  const learning = progress.filter(({ course, done }) => Boolean(enrollments[course.id]) || done.length > 0 || progressRecords.some((record) => record.courseId === course.id));
  const completedCourses = progress.filter((item) => item.percentage === 100);
  const active = learning.find((item) => item.percentage < 100) ?? learning[0] ?? progress[0];
  const firstName = viewer?.displayName.split(/\s|@/)[0] || "Learner";

  return <div className="dashboard-page"><Navbar compact /><main id="main-content" className="dashboard-shell"><header className="dashboard-heading"><div><span className="eyebrow">MY LEARNING</span><h1>Welcome back, {firstName}.</h1><p>Continue a lesson, open an assigned project, or review your course progress.</p></div></header>
    {!ready ? <div className="dashboard-skeleton skeleton" aria-label="Loading learning progress" /> : !learning.length ? <section className="learning-empty" aria-labelledby="learning-empty-heading"><span><BookOpen size={30} aria-hidden="true" /></span><div><span className="eyebrow">START YOUR FIRST COURSE</span><h2 id="learning-empty-heading">Your learning plan is ready.</h2><p>Choose a course, enroll, and progress through its modules, lessons, prerequisites, and two assigned projects.</p><Link className="button" href="/courses">Browse courses <ArrowRight size={18} aria-hidden="true" /></Link></div></section> : <>
      <section className="continue-card" aria-labelledby="continue-heading"><div className="continue-copy"><span className="overline">CONTINUE LEARNING</span><h2 id="continue-heading">{active.current.lesson.title}</h2><p>{active.course.shortTitle} · {active.current.unit.title}</p><Link className="button button-light" href={lessonHref(active.course.slug, active.current.unit.id, active.current.lesson.id)}>Continue learning <ArrowRight size={19} aria-hidden="true" /></Link></div><div className="continue-progress"><div className="progress-ring" role="progressbar" aria-label={`${active.percentage}% of course completed`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={active.percentage} style={{ "--progress": `${active.percentage * 3.6}deg` } as React.CSSProperties}><span>{active.percentage}%</span></div><p>{active.completedProjects} of {active.projectCount} projects complete</p></div></section>
      <section className="all-learning"><div className="section-title-row"><div><span className="eyebrow">YOUR COURSES</span><h2>Course progress</h2></div><Link href="/courses">Browse catalog <ArrowRight size={17} aria-hidden="true" /></Link></div><div className="dashboard-course-grid">{learning.map(({ course, lessons, done, current, percentage, completedProjects, projectCount }) => <article key={course.id}><div><span>{course.careerPath}</span><h3>{course.shortTitle}</h3><p>{done.length} of {lessons.length} lessons · {completedProjects} of {projectCount} projects</p></div><ProgressBar value={percentage} label={`${course.shortTitle}: ${percentage}% complete`} /><div><small>Next lesson</small><strong>{current.lesson.title}</strong></div><Link className="button button-secondary" href={lessonHref(course.slug, current.unit.id, current.lesson.id)}>{percentage ? "Continue" : "Start"} <ArrowRight size={16} aria-hidden="true" /></Link></article>)}</div></section>
      {completedCourses.length > 0 && <section className="completed-courses"><div className="section-title-row"><div><span className="eyebrow">COMPLETION</span><h2>Completed courses</h2></div></div><div>{completedCourses.map(({ course }) => <article key={course.id}><CheckCircle2 size={22} aria-hidden="true" /><strong>{course.title}</strong></article>)}</div></section>}
      <section className="dashboard-summary" aria-label="Learning summary"><article><CheckCircle2 size={22} aria-hidden="true" /><strong>{completed.length}</strong><span>Lessons completed</span></article><article><FolderKanban size={22} aria-hidden="true" /><strong>{completedCourses.length}</strong><span>Courses completed</span></article><article><BookOpen size={22} aria-hidden="true" /><strong>{learning.length}</strong><span>Courses started</span></article></section>
    </>}
  </main></div>;
}
