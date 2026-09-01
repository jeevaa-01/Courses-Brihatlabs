import type { Course } from "../types/course";
import { allCourses } from "./course-data";

export type CourseProjectStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";

type ProjectMilestone = { id: string; title: string; objective: string; deliverables: string[]; acceptance: string[] };
export type CourseProject = ProjectSpec & {
  courseId: string;
  courseSlug: string;
  position: 1 | 2;
  insertAfterModule: number;
  prerequisiteUnitIds: string[];
  category: string;
  industry: string;
  role: string;
  businessContext: string;
  assignment: string;
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  architecture: string[];
  testing: string[];
  deployment: string[];
  milestones: ProjectMilestone[];
  projectType: ProjectSpec["type"];
  relatedCourseSlugs: string[];
  portfolioReady: boolean;
};

type ProjectSpec = {
  slug: string;
  title: string;
  summary: string;
  difficulty: "Foundation" | "Intermediate";
  duration: string;
  skills: string[];
  technologies: string[];
  type: "Guided" | "Semi-Guided";
  markers: string[];
};

const curatedSpecs: Record<string, [ProjectSpec, ProjectSpec]> = {
  "data-analytics": [
    { slug: "retail-sales-analysis", title: "Retail Sales Analysis", summary: "Clean a retail sales dataset, calculate KPIs, and explain revenue trends across products and regions.", difficulty: "Foundation", duration: "3–4 hours", skills: ["Excel", "SQL", "Pandas", "Data Cleaning", "EDA"], technologies: ["Excel", "SQL", "Python", "Pandas"], type: "Guided", markers: ["Data Cleaning & Wrangling"] },
    { slug: "business-performance-dashboard", title: "Business Performance Dashboard", summary: "Turn trusted metrics into an interactive dashboard and a concise recommendation for business leaders.", difficulty: "Intermediate", duration: "5–7 hours", skills: ["Power BI", "Statistics", "Business Analytics", "Visualization"], technologies: ["Power BI", "Tableau", "SQL", "Data Visualization"], type: "Semi-Guided", markers: ["Power BI / Tableau & Dashboards"] },
  ],
  "data-science": [
    { slug: "customer-data-exploration", title: "Customer Data Exploration", summary: "Clean, explore, and visualize customer data while communicating the uncertainty behind each finding.", difficulty: "Foundation", duration: "3–5 hours", skills: ["Python", "NumPy", "Pandas", "SQL", "Statistics", "EDA"], technologies: ["Python", "NumPy", "Pandas", "SQL"], type: "Guided", markers: ["Exploratory Data Analysis", "EDA"] },
    { slug: "customer-churn-prediction", title: "Customer Churn Prediction", summary: "Build a leakage-resistant churn pipeline, evaluate a classifier, and document the limits of the prediction.", difficulty: "Intermediate", duration: "6–8 hours", skills: ["Machine Learning", "Classification", "Feature Engineering", "Model Evaluation"], technologies: ["Python", "Pandas", "scikit-learn", "Jupyter"], type: "Semi-Guided", markers: ["Model Evaluation", "Optimization", "Machine Learning"] },
  ],
  "machine-learning": [
    { slug: "house-price-prediction", title: "House Price Prediction", summary: "Prepare housing data, engineer useful features, and compare regression models against a clear baseline.", difficulty: "Foundation", duration: "3–5 hours", skills: ["Data Preprocessing", "Regression", "Feature Engineering", "Model Evaluation"], technologies: ["Python", "Pandas", "scikit-learn", "Jupyter"], type: "Guided", markers: ["Linear Regression", "Preprocessing"] },
    { slug: "customer-churn-classification", title: "Customer Churn Classification", summary: "Compare classification models, choose meaningful metrics, and explain the trade-offs behind the final threshold.", difficulty: "Intermediate", duration: "5–8 hours", skills: ["Classification", "Model Comparison", "Metrics", "Feature Engineering"], technologies: ["Python", "Pandas", "scikit-learn", "Model Evaluation"], type: "Semi-Guided", markers: ["Model Evaluation", "Model Improvement"] },
  ],
  "data-engineer": [
    { slug: "batch-etl-pipeline", title: "Batch ETL Pipeline", summary: "Build a reliable source-to-analytics table workflow with extraction, transformation, validation, and loading.", difficulty: "Foundation", duration: "3–5 hours", skills: ["Python", "SQL", "ETL", "Data Transformation"], technologies: ["Python", "SQL", "Pandas", "Docker"], type: "Guided", markers: ["ETL", "Data Transformation"] },
    { slug: "production-data-pipeline", title: "Production Data Pipeline", summary: "Design an observable end-to-end pipeline with orchestration, quality checks, recovery, and a documented operating model.", difficulty: "Intermediate", duration: "6–8 hours", skills: ["Spark", "Airflow", "Kafka", "Data Quality"], technologies: ["Spark", "Airflow", "Kafka", "Docker"], type: "Semi-Guided", markers: ["Production", "Pipeline", "Orchestration"] },
  ],
  "generative-ai": [
    { slug: "document-question-answering-assistant", title: "Document Question Answering Assistant", summary: "Create a grounded assistant that answers questions from a small document set with safe fallback behavior.", difficulty: "Foundation", duration: "3–5 hours", skills: ["LLM APIs", "Prompt Engineering", "Embeddings", "Vector Databases"], technologies: ["Python", "LLM API", "Embeddings", "Vector Store"], type: "Guided", markers: ["Embeddings", "Vector", "RAG"] },
    { slug: "rag-customer-support-assistant", title: "RAG Customer Support Assistant", summary: "Build a cited support workflow that retrieves relevant context, evaluates answer quality, and escalates uncertainty.", difficulty: "Intermediate", duration: "6–8 hours", skills: ["RAG", "Retrieval", "Chunking", "Prompting", "Evaluation"], technologies: ["Python", "RAG", "Vector Database", "Evaluation"], type: "Semi-Guided", markers: ["RAG", "Retrieval", "Evaluation"] },
  ],
  "agentic-ai": [
    { slug: "ai-research-agent", title: "AI Research Agent", summary: "Build a bounded research agent that plans a query, uses approved tools, checks results, and cites its response.", difficulty: "Foundation", duration: "3–5 hours", skills: ["LLM Fundamentals", "Tool Calling", "Agent Loops", "Planning"], technologies: ["Python", "LLM API", "Tool Calling", "Evaluation"], type: "Guided", markers: ["Building AI Agents", "Tools", "Function Calling"] },
    { slug: "multi-agent-workflow-system", title: "Multi-Agent Workflow System", summary: "Coordinate a supervisor and specialist agents with memory, validation, and explicit handoff boundaries.", difficulty: "Intermediate", duration: "6–8 hours", skills: ["Memory", "LangGraph", "Multi-Agent Architecture", "MCP", "Tool Integration"], technologies: ["Python", "LangGraph", "MCP", "Agent Evaluation"], type: "Semi-Guided", markers: ["Multi-Agent", "MCP", "Framework"] },
  ],
  "full-stack-development": [
    { slug: "interactive-saas-dashboard", title: "Interactive SaaS Dashboard", summary: "Build an accessible dashboard that combines responsive UI, state, API data, and useful loading and error states.", difficulty: "Foundation", duration: "3–5 hours", skills: ["HTML/CSS", "JavaScript", "React", "APIs"], technologies: ["HTML", "CSS", "React", "REST API"], type: "Guided", markers: ["Frontend Development", "React"] },
    { slug: "full-stack-web-application", title: "Full Stack Web Application", summary: "Ship a complete application with frontend, backend, database, authentication, tests, and deployment notes.", difficulty: "Intermediate", duration: "6–8 hours", skills: ["Frontend", "Backend", "Database", "Authentication", "APIs", "Deployment"], technologies: ["React", "Node.js", "SQL", "Docker"], type: "Semi-Guided", markers: ["Authentication", "Security", "Databases"] },
  ],
  "mern-stack-development": [
    { slug: "mern-task-manager", title: "MERN Task Manager", summary: "Create a task workflow with MongoDB, Express, React, Node, validation, and clear CRUD states.", difficulty: "Foundation", duration: "3–5 hours", skills: ["MongoDB", "Express", "React", "Node", "CRUD"], technologies: ["MongoDB", "Express", "React", "Node.js"], type: "Guided", markers: ["React", "Node.js"] },
    { slug: "mern-e-commerce-application", title: "MERN E-Commerce Application", summary: "Build a role-aware commerce flow with authentication, products, REST APIs, cart, orders, and persistence.", difficulty: "Intermediate", duration: "6–8 hours", skills: ["Authentication", "Product Management", "Database", "REST APIs", "Cart", "Orders"], technologies: ["MongoDB", "Express", "React", "Node.js"], type: "Semi-Guided", markers: ["Full MERN Integration", "Authentication", "Deployment"] },
  ],
  "software-testing-qa": [
    { slug: "e-commerce-manual-testing", title: "E-Commerce Manual Testing", summary: "Create risk-based scenarios, test cases, defect reports, and a regression checklist for a commerce flow.", difficulty: "Foundation", duration: "2–4 hours", skills: ["Test Scenarios", "Test Cases", "Defect Reports", "Regression"], technologies: ["Test Design", "SQL", "Postman", "Issue Tracking"], type: "Guided", markers: ["Manual Testing", "Test Case"] },
    { slug: "automated-regression-suite", title: "Automated Regression Suite", summary: "Automate a critical browser and API journey with reliable fixtures, assertions, reports, and CI evidence.", difficulty: "Intermediate", duration: "5–8 hours", skills: ["Playwright", "Selenium", "API Testing", "Regression Automation", "Reporting"], technologies: ["Playwright", "TypeScript", "API Testing", "CI/CD"], type: "Semi-Guided", markers: ["Automation Testing", "Playwright", "CI/CD"] },
  ],
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function moduleCutoff(course: Course, markers: string[], fallback: number) {
  const index = course.units.findIndex((unit) => markers.some((marker) => `${unit.title} ${unit.description}`.toLowerCase().includes(marker.toLowerCase())));
  return Math.min(course.units.length, Math.max(1, index >= 0 ? index + 1 : fallback));
}

function makeProject(course: Course, spec: ProjectSpec, position: 1 | 2): CourseProject {
  const fallback = position === 1 ? Math.max(1, Math.ceil(course.units.length * 0.4)) : Math.max(1, Math.ceil(course.units.length * 0.75));
  const insertAfterModule = moduleCutoff(course, spec.markers, fallback);
  const prerequisiteUnits = course.units.slice(0, insertAfterModule);
  const category = course.careerPath === "Development" ? "Development" : course.careerPath === "Quality" ? "Software Testing" : "Data & AI";
  return {
    ...spec,
    courseId: course.id,
    courseSlug: course.slug,
    position,
    insertAfterModule,
    prerequisiteUnitIds: prerequisiteUnits.map((unit) => unit.id),
    category,
    industry: "Practical portfolio work",
    role: course.jobs[0] || "Practitioner",
    businessContext: `Use the skills from the first ${insertAfterModule} modules of ${course.shortTitle} to solve a realistic problem with evidence a reviewer can inspect.`,
    assignment: spec.summary,
    functionalRequirements: ["Define the problem and success measure", "Build a working solution", "Explain one important decision", "Validate the result with repeatable evidence"],
    nonFunctionalRequirements: ["Document assumptions", "Handle at least one failure case", "Keep the work reproducible", "State one limitation"],
    architecture: ["Problem", "Inputs", "Implementation", "Validation", "Portfolio evidence"],
    testing: ["Happy-path check", "Boundary or failure check", "Evidence review", "Reproducibility check"],
    deployment: ["Document setup", "Record environment assumptions", "Include a repeatable run or demo"],
    milestones: [
      { id: "frame", title: "Frame the problem", objective: "Define the audience, inputs, outcome, and success measure.", deliverables: ["Problem statement", "Success measure", "Assumptions"], acceptance: ["The target outcome is testable"] },
      { id: "build", title: "Build the solution", objective: "Apply the prerequisite modules in a small, working implementation.", deliverables: ["Working implementation", "README notes", "Sample output"], acceptance: ["The core workflow works on representative input"] },
      { id: "validate", title: "Validate and improve", objective: "Test the result, inspect failure behavior, and make one evidence-led improvement.", deliverables: ["Validation checks", "Failure note", "Improvement record"], acceptance: ["At least one non-happy path is handled"] },
      { id: "present", title: "Present the evidence", objective: "Explain decisions, limitations, and what you would do next.", deliverables: ["Demo or screenshots", "Portfolio summary", "Next steps"], acceptance: ["A reviewer can understand what was built and why"] },
    ],
    projectType: spec.type,
    relatedCourseSlugs: [course.slug],
    portfolioReady: true,
  };
}

function orderedProject(project: CourseProject, course: Course, insertAfterModule: number) {
  const cutoff = Math.min(course.units.length, Math.max(1, insertAfterModule));
  return {
    ...project,
    insertAfterModule: cutoff,
    prerequisiteUnitIds: course.units.slice(0, cutoff).map((unit) => unit.id),
    businessContext: `Use the skills from the first ${cutoff} modules of ${course.shortTitle} to solve a realistic problem with evidence a reviewer can inspect.`,
  };
}

function fallbackSpecs(course: Course): [ProjectSpec, ProjectSpec] {
  const base = slugify(course.shortTitle);
  return [
    { slug: `${base}-foundations-lab`, title: `${course.shortTitle} Foundations Lab`, summary: `Apply the core concepts from the first part of ${course.shortTitle} in a guided, reproducible exercise.`, difficulty: "Foundation", duration: "2–4 hours", skills: course.tags.slice(0, 4), technologies: course.tags.slice(0, 4), type: "Guided", markers: [course.units[Math.min(1, course.units.length - 1)]?.title || ""] },
    { slug: `${base}-portfolio-build`, title: `${course.shortTitle} Portfolio Build`, summary: `Combine the later skills from ${course.shortTitle} into a practical project with documented evidence.`, difficulty: "Intermediate", duration: "4–8 hours", skills: course.tags.slice(0, 5), technologies: course.tags.slice(0, 5), type: "Semi-Guided", markers: [course.units[Math.max(0, course.units.length - 2)]?.title || ""] },
  ];
}

export const courseProjectPlans: Record<string, [CourseProject, CourseProject]> = Object.fromEntries(allCourses.map((course) => {
  const specs = curatedSpecs[course.slug] || fallbackSpecs(course);
  const projects = [makeProject(course, specs[0], 1), makeProject(course, specs[1], 2)] as const;
  const cutoffs = projects.map((project) => project.insertAfterModule).sort((a, b) => a - b);
  return [course.slug, [orderedProject(projects[0], course, cutoffs[0]), orderedProject(projects[1], course, cutoffs[1])]];
})) as Record<string, [CourseProject, CourseProject]>;

export const minorProjectCatalog = Object.values(courseProjectPlans).flat();

export function courseProjectsFor(courseOrSlug: Course | string) {
  const slug = typeof courseOrSlug === "string" ? courseOrSlug : courseOrSlug.slug;
  return courseProjectPlans[slug] || [];
}

export function findCourseProject(slug: string) {
  return minorProjectCatalog.find((project) => project.slug === slug) || null;
}

export function prerequisitesComplete(project: CourseProject, course: Course, completed: Set<string>) {
  return project.prerequisiteUnitIds.every((unitId) => {
    const unit = course.units.find((item) => item.id === unitId);
    return Boolean(unit && unit.lessons.every((lesson) => completed.has(`${course.id}/${unit.id}/${lesson.id}`)));
  });
}

export function projectStatus(project: CourseProject, course: Course, completed: Set<string>, submission?: { status?: string }) : CourseProjectStatus {
  if (!prerequisitesComplete(project, course, completed)) return "LOCKED";
  if (submission?.status === "completed") return "COMPLETED";
  if (submission?.status === "submitted") return "SUBMITTED";
  if (submission?.status === "in_progress") return "IN_PROGRESS";
  return "AVAILABLE";
}
