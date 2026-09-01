"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Award, BarChart3, BookOpen, Bot, Braces, Check, Code2, FileQuestion, FolderGit2, GitBranch, Layers3, LineChart, Search, ServerCog, ShieldCheck, SlidersHorizontal, Sparkles, Table2, TestTube2, X } from "lucide-react";
import type { Course, CourseSubject } from "../types/course";
import { courses, dataAnalyticsCourse, findLessonExact, lessonHref, lessonsForCourse } from "../lib/course-data";
import { Footer, Navbar } from "./navigation";
import { useProgress } from "./providers";
import { Pill } from "./ui";
import { ResponsiveSlider } from "./responsive-slider";
import { courseProjectsFor, projectStatus } from "../lib/course-projects";

const courseIcons: Record<CourseSubject, typeof BarChart3> = { analytics: BarChart3, science: Braces, ml: LineChart, agents: Bot, fullstack: Layers3, mern: ServerCog, testing: TestTube2 };
const learningFeatures = [
  [GitBranch, "Visual explanations", "Follow responsive flows and architecture views before technical detail."],
  [Code2, "Runnable examples", "Practice small HTML, CSS, JavaScript, Python, SQL, API, and testing examples."],
  [FolderGit2, "Portfolio projects", "Finish with a repository, README, demo, evidence, and a resume-ready explanation."],
  [FileQuestion, "Saved quizzes", "Ten-question checks provide explanations, retry support, and saved progress."],
  [ShieldCheck, "Quality habits", "Accessibility, validation, security, testing, and failure handling appear throughout."],
  [Table2, "Interview preparation", "Explain trade-offs, common mistakes, and the evidence behind your decisions."],
] as const;

const careerPaths = [
  { name: "Data & AI", description: "Understand data, build predictions, then create AI systems that can reason and act.", slugs: ["data-analytics", "data-science", "machine-learning", "agentic-ai"] },
  { name: "Development", description: "Learn the whole web stack, then specialize in production JavaScript applications.", slugs: ["full-stack-development", "mern-stack-development"] },
  { name: "Quality", description: "Build confidence from manual testing through APIs, automation, CI/CD, and AI-assisted QA.", slugs: ["software-testing-qa"] },
] as const;

const goals = [
  ["Become a Data Analyst", "data-analytics", ["Excel + SQL", "Data cleaning", "EDA", "Dashboards", "Business insights"]],
  ["Become a Data Scientist", "data-science", ["Python + SQL", "Statistics", "EDA", "Feature engineering", "Machine learning"]],
  ["Become an ML Engineer", "machine-learning", ["Python", "Data preparation", "Algorithms", "Evaluation", "Deployment"]],
  ["Become an AI Engineer", "agentic-ai", ["LLMs", "Tools", "RAG", "MCP", "Evaluation + guardrails"]],
  ["Become a Full Stack Developer", "full-stack-development", ["HTML/CSS", "JavaScript", "React", "Backend + database", "Testing", "Docker + deployment"]],
  ["Become a MERN Developer", "mern-stack-development", ["Modern JavaScript", "React", "Express + Node", "MongoDB", "Production MERN"]],
  ["Become a QA / Tester", "software-testing-qa", ["Manual testing", "API + SQL", "Playwright", "Performance", "CI/CD + AI QA"]],
] as const;

function HighlightText({ text, query }: { text: string; query?: string }) {
  const terms = query?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!terms.length) return text;
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "ig");
  return <>{text.split(pattern).map((part, index) => terms.some((term) => term.toLowerCase() === part.toLowerCase()) ? <mark key={`${part}-${index}`}>{part}</mark> : part)}</>;
}

export function CourseCard({ course, query }: { course: Course; query?: string }) {
  const Icon = courseIcons[course.subject];
  const { enrollments, isComplete, lastLesson, minorProjectSubmissions, progressRecords } = useProgress();
  const lessons = lessonsForCourse(course.slug);
  const done = lessons.filter(({ unit, lesson }) => isComplete(course.id, unit.id, lesson.id));
  const projects = courseProjectsFor(course);
  const projectCount = projects.length;
  const completedKeys = new Set(done.map(({ unit, lesson }) => `${course.id}/${unit.id}/${lesson.id}`));
  const completedProjects = projects.filter((project) => projectStatus(project, course, completedKeys, minorProjectSubmissions[project.slug]) === "COMPLETED").length;
  const percentage = Math.min(100, Math.round((done.length / lessons.length) * 80 + (completedProjects / projectCount) * 20));
  const next = lessons.find(({ unit, lesson }) => !isComplete(course.id, unit.id, lesson.id)) ?? lessons[0];
  const started = Boolean(enrollments[course.id]) || progressRecords.some((record) => record.courseId === course.id);
  const complete = done.length === lessons.length && completedProjects === projectCount;
  const status = complete ? "Completed" : started ? "In progress" : "Not started";
  const cta = complete ? "Review course" : started ? "Continue learning" : "View course";
  const resume = lastLesson?.courseSlug === course.slug ? findLessonExact(lastLesson.courseSlug, lastLesson.unitId, lastLesson.lessonId) : undefined;
  const resumeLesson = resume && !isComplete(course.id, resume.unit.id, resume.lesson.id) ? resume : next;
  const href = started && !complete ? lessonHref(course.slug, resumeLesson.unit.id, resumeLesson.lesson.id) : `/courses/${course.slug}`;
  const lastCompletedRecord = progressRecords.filter((record) => record.courseId === course.id && record.completed).sort((a, b) => (b.completedAt || b.updatedAt).localeCompare(a.completedAt || a.updatedAt))[0];
  const lastCompletedLesson = lastCompletedRecord ? lessons.find(({ unit, lesson }) => unit.id === lastCompletedRecord.unitId && lesson.id === lastCompletedRecord.lessonId)?.lesson.title : null;
  return <article className={`catalog-card course-card-${course.subject}`}>
    <div className="catalog-art"><Icon size={42} aria-hidden="true"/><span>{course.careerPath.toUpperCase()}</span></div>
    <div className="catalog-body"><div className="course-card-top"><span>{course.level}</span><strong>{course.duration}</strong></div><span className={`course-status status-${complete ? "complete" : started ? "progress" : "new"}`}>{status}</span><h2><HighlightText text={course.title} query={query}/></h2><p><HighlightText text={course.outcomes[0] || course.shortDescription} query={query}/></p><div className="catalog-meta"><span><Layers3 size={15} aria-hidden="true"/> {course.units.length} modules</span><span><BookOpen size={15} aria-hidden="true"/> {course.lessonCountLabel} lessons</span><span><FolderGit2 size={15} aria-hidden="true"/> {projectCount} projects</span><span><Award size={15} aria-hidden="true"/> Certificate</span></div>{started && <div className="card-progress"><div><span>Progress</span><strong>{percentage}%</strong></div><div role="progressbar" aria-label={`${course.shortTitle} ${percentage}% complete`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}><span style={{ width: `${percentage}%` }}/></div>{lastCompletedLesson && <small>Last completed: {lastCompletedLesson}</small>}</div>}<div className="course-tags">{course.tags.slice(0,4).map((tag) => <span key={tag}>{tag}</span>)}</div><Link className="button course-card-cta" href={href} aria-label={`${cta}: ${course.shortTitle}`}>{cta} <ArrowRight size={17} aria-hidden="true"/></Link></div>
  </article>;
}

function CourseGrid({ items }: { items: Course[] }) {
  const { ready } = useProgress();
  const cards = !ready ? items.map((course) => <div className="catalog-card course-card-skeleton" aria-hidden="true" key={course.id}><div className="skeleton skeleton-card-art"/><div className="skeleton skeleton-line"/><div className="skeleton skeleton-title"/><div className="skeleton skeleton-line"/></div>) : items.map((course) => <CourseCard course={course} key={course.id}/>);
  return <ResponsiveSlider ariaLabel={ready ? "Courses" : "Loading courses"} className="course-catalog-slider" itemClassName="course-catalog-slide">{cards}</ResponsiveSlider>;
}

export function HomePage() {
  const firstLesson = lessonsForCourse(dataAnalyticsCourse.slug)[0];
  return <div className="site-page"><Navbar/><main id="main-content">
    <section className="hero section-shell learning-hero"><div className="hero-copy"><Pill tone="brand"><Sparkles size={16} aria-hidden="true"/> SOFTWARE · DATA · AI</Pill><h1>Learn. Build. Test. <span>Analyze. Create.</span></h1><p>Master software development, data, machine learning and AI through simple explanations, visual learning, practical coding, real-world projects and career-focused learning.</p><div className="button-row"><Link className="button" href="/courses">Explore Courses <ArrowRight size={19} aria-hidden="true"/></Link><Link className="button button-secondary" href={lessonHref(dataAnalyticsCourse.slug, firstLesson.unit.id, firstLesson.lesson.id)}>Start learning</Link></div><div className="hero-proof"><span><Check size={17} aria-hidden="true"/> Seven complete courses</span><span><Check size={17} aria-hidden="true"/> Projects + quizzes</span><span><Check size={17} aria-hidden="true"/> Career portfolio support</span></div></div><PlatformVisual/></section>
    <section className="section-shell explore-courses" id="courses"><div className="section-heading"><div><div className="eyebrow">SEVEN LEARNING PATHS</div><h2>Choose the course that fits your next goal</h2></div><p>Follow a structured path from short lessons and visual explanations to practice, quizzes, projects, deployment, and a portfolio you can discuss.</p></div><CourseGrid items={courses}/></section>
    <CareerPathSection/>
    <section className="section-shell learn-section" id="about"><div className="section-heading"><div><div className="eyebrow">LEARN BY DOING</div><h2>Every concept leads to useful evidence</h2></div><p>Move from intuition to technical understanding, then practice, build, test, deploy, and showcase what you learned.</p></div><div className="learn-grid learning-feature-grid">{learningFeatures.map(([Icon, title, description]) => <article className="learn-card" key={title}><span className="learn-icon"><Icon size={24} aria-hidden="true"/></span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="portfolio-philosophy"><div className="section-shell"><span className="eyebrow eyebrow-light">CAREER-FOCUSED LEARNING</span><h2>Learn → Understand → Practice → Build → Test → Deploy → Showcase</h2><p>Every course includes practical work, GitHub guidance, README expectations, interview prompts, and a clear next step.</p><Link className="button button-light" href="/courses">Find your course <ArrowRight size={18} aria-hidden="true"/></Link></div></section>
  </main><Footer/></div>;
}

function PlatformVisual() {
  return <div className="agent-visual platform-visual" role="img" aria-label="Three career paths connect Data and AI, Development, and Software Quality"><div className="visual-grid"/><div className="platform-core"><Sparkles size={25} aria-hidden="true"/><strong>Career Learning</strong><small>Learn · Build · Showcase</small></div><div className="platform-lanes"><span><BarChart3 size={20} aria-hidden="true"/> Data & AI</span><span><Layers3 size={20} aria-hidden="true"/> Development</span><span><TestTube2 size={20} aria-hidden="true"/> Quality</span></div></div>;
}

function CareerPathSection() {
  return <section className="career-paths" id="learning-paths"><div className="section-shell"><div className="section-heading"><div><div className="eyebrow eyebrow-light">CHOOSE YOUR CAREER PATH</div><h2>Three connected routes through seven courses</h2></div><p>Start where your goal is clearest. Each course shows the recommended continuation when you complete it.</p></div><div className="career-path-grid">{careerPaths.map((path) => <article key={path.name}><span>{path.name}</span><p>{path.description}</p><ol>{path.slugs.map((slug, index) => { const course = courses.find((item) => item.slug === slug)!; return <li key={slug}><Link href={`/courses/${slug}`}>{course.shortTitle}</Link>{index < path.slugs.length - 1 && <ArrowRight size={15} aria-hidden="true"/>}</li>; })}</ol></article>)}</div></div></section>;
}

const filterOptions = ["Beginner", "Intermediate", "Data & AI", "Development", "Quality", "Agentic AI", "Generative AI", "AI Agents", "RAG", "LLM Engineering", "Python", "Deployment", "React", "Playwright", "Completed", "In progress"] as const;
type FilterName = typeof filterOptions[number];

const levelFilters = new Set<FilterName>(["Beginner", "Intermediate"]);
const pathFilters = new Set<FilterName>(["Data & AI", "Development", "Quality"]);
const statusFilters = new Set<FilterName>(["Completed", "In progress"]);

export function CoursesPage() {
  const { isComplete, minorProjectSubmissions, progressRecords, ready } = useProgress();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterName[]>([]);
  const [sort, setSort] = useState("recommended");
  const results = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const statusFor = (course: Course) => { const lessons = lessonsForCourse(course.slug); const done = lessons.filter(({ unit, lesson }) => isComplete(course.id, unit.id, lesson.id)); const projects = courseProjectsFor(course); const completedKeys = new Set(done.map(({ unit, lesson }) => `${course.id}/${unit.id}/${lesson.id}`)); const complete = done.length === lessons.length && projects.every((project) => projectStatus(project, course, completedKeys, minorProjectSubmissions[project.slug]) === "COMPLETED"); return complete ? "Completed" : progressRecords.some((record) => record.courseId === course.id) ? "In progress" : "Not started"; };
    const filtered = courses.filter((course) => {
      const searchable = `${course.title} ${course.shortDescription} ${course.tags.join(" ")} ${course.units.map((unit) => `${unit.title} ${unit.lessons.map((lesson) => lesson.title).join(" ")}`).join(" ")}`.toLowerCase();
      if (!terms.every((term) => searchable.includes(term))) return false;
      const selectedLevels = filters.filter((filter) => levelFilters.has(filter));
      const selectedPaths = filters.filter((filter) => pathFilters.has(filter));
      const selectedStatuses = filters.filter((filter) => statusFilters.has(filter));
      const selectedSkills = filters.filter((filter) => !levelFilters.has(filter) && !pathFilters.has(filter) && !statusFilters.has(filter));
      if (selectedLevels.length && !selectedLevels.some((filter) => course.level.includes(filter))) return false;
      if (selectedPaths.length && !selectedPaths.includes(course.careerPath)) return false;
      if (selectedStatuses.length && !selectedStatuses.some((filter) => filter === statusFor(course))) return false;
      return selectedSkills.every((filter) => {
        const term = filter === "LLM Engineering" ? "llm" : filter === "Deployment" ? "deploy" : filter.toLowerCase();
        return course.tags.some((tag) => tag.toLowerCase().includes(term)) || searchable.includes(term);
      });
    });
    const difficulty = (course: Course) => course.level === "Beginner" ? 0 : course.level.includes("Intermediate") ? 1 : 2;
    return [...filtered].sort((a, b) => sort === "shortest" ? Number(a.duration.match(/\d+/)?.[0] || 99) - Number(b.duration.match(/\d+/)?.[0] || 99) : sort === "difficulty" ? difficulty(a) - difficulty(b) : courses.indexOf(a) - courses.indexOf(b));
  }, [filters, isComplete, minorProjectSubmissions, progressRecords, query, sort]);
  const toggleFilter = (filter: FilterName) => setFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  const clear = () => { setQuery(""); setFilters([]); setSort("recommended"); };

  return <div className="site-page"><Navbar/><main id="main-content" className="inner-page section-shell courses-discovery"><div className="page-kicker">LEARNING MARKETPLACE</div><h1>Choose the Career You Want to Build</h1><p className="page-lede">Career goals, courses, modules, lessons, and applied projects now live in one canonical learning catalog.</p><p className="catalog-consolidation-note"><strong>Career Programs</strong> are organized here as course sequences. Every course includes exactly 2 practical projects that unlock inside its curriculum.</p>
    <section className="discovery-controls" aria-label="Course search and filters" aria-busy={!ready}><div className="course-search"><div className="search-field"><Search size={20} aria-hidden="true"/><label className="sr-only" htmlFor="catalog-search">Search courses, skills or tools</label><input id="catalog-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, skills or tools" type="search" autoComplete="off"/>{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={18} aria-hidden="true"/></button>}</div></div><div className="filter-bar"><span><SlidersHorizontal size={18} aria-hidden="true"/> Filters</span>{filterOptions.map((filter) => <button type="button" className={filters.includes(filter) ? "active" : ""} aria-pressed={filters.includes(filter)} onClick={() => toggleFilter(filter)} key={filter}>{filter}</button>)}</div>{(filters.length > 0 || query) && <div className="active-filters" aria-label="Active filters">{query && <button type="button" onClick={() => setQuery("")}>Search: {query}<X size={14} aria-hidden="true"/><span className="sr-only">Clear search term</span></button>}{filters.map((filter) => <button type="button" onClick={() => toggleFilter(filter)} key={filter}>{filter}<X size={14} aria-hidden="true"/><span className="sr-only">Remove filter</span></button>)}<button type="button" className="clear-filters" onClick={clear}>Clear all filters</button></div>}<div className="results-toolbar"><p aria-live="polite"><strong>{ready ? results.length : "—"}</strong> course{results.length === 1 ? "" : "s"}</p><label htmlFor="course-sort">Sort by</label><select id="course-sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="shortest">Shortest duration</option><option value="difficulty">Difficulty</option></select></div></section>
    {!ready ? <CourseGrid items={courses}/> : results.length ? <ResponsiveSlider ariaLabel="Filtered courses" className="course-catalog-slider" itemClassName="course-catalog-slide">{results.map((course) => <CourseCard course={course} query={query} key={course.id}/>)}</ResponsiveSlider> : <section className="no-results" role="status"><Search size={30} aria-hidden="true"/><h2>No courses match those filters</h2><p>Try a broader skill, remove a filter, or choose a career path below.</p><button className="button button-secondary" type="button" onClick={clear}>Clear search and filters</button></section>}
    <RecommendationSection/>
    <CourseComparison/>
  </main><Footer/></div>;
}

function RecommendationSection() {
  const [selected, setSelected] = useState<(typeof goals)[number]>(goals[0]);
  const course = courses.find((item) => item.slug === selected[1])!;
  return <section className="recommendation-section" aria-labelledby="recommendation-heading"><div><span className="eyebrow">WHAT SHOULD I LEARN FIRST?</span><h2 id="recommendation-heading">What is your goal?</h2><div className="goal-options">{goals.map((goal) => <button type="button" aria-pressed={selected[0] === goal[0]} className={selected[0] === goal[0] ? "active" : ""} onClick={() => setSelected(goal)} key={goal[0]}>{goal[0]}</button>)}</div></div><article aria-live="polite"><span>RECOMMENDED COURSE</span><h3>{course.shortTitle}</h3><p>{course.shortDescription}</p><ol>{selected[2].map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol><Link className="button" href={`/courses/${course.slug}`}>View learning plan <ArrowRight size={17} aria-hidden="true"/></Link></article></section>;
}

function CourseComparison() {
  return <section className="catalog-comparison" aria-labelledby="comparison-heading"><span className="eyebrow">COURSE COMPARISON</span><h2 id="comparison-heading">Which course should I learn?</h2><div className="difference-table" role="region" aria-label="Seven course comparison" tabIndex={0}><table><thead><tr><th scope="col">Course</th><th scope="col">Main goal</th><th scope="col">Main technologies</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id}><th scope="row"><Link href={`/courses/${course.slug}`}>{course.shortTitle}</Link></th><td>{course.focus}</td><td>{course.tags.slice(0,4).join(", ")}</td></tr>)}</tbody></table></div></section>;
}
