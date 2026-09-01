import { findCourse } from "../../../../lib/course-data";
import { findCourseProject, projectStatus } from "../../../../lib/course-projects";
import { privateHeaders, publicCourseHeaders } from "../../../../lib/http";
import { readServerProgress } from "../../../../lib/server-course-progress";
import { emptyProjectWorkspace, readProjectWorkspace, saveProjectWorkspace, type ProjectWorkspace } from "../../../../lib/project-workspace";
import { getChatGPTUser } from "../../../chatgpt-auth";

const MAX_TEXT = 20_000;

function validUrl(value: unknown) {
  if (value === undefined || value === "") return true;
  if (typeof value !== "string" || value.length > 2_000) return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

function validWorkspace(value: unknown, project: ReturnType<typeof findCourseProject>): value is ProjectWorkspace {
  if (!project || !value || typeof value !== "object") return false;
  const workspace = value as Partial<ProjectWorkspace>;
  const submission = workspace.submission;
  return Array.isArray(workspace.milestones) && workspace.milestones.every((id) => typeof id === "string" && project.milestones.some((milestone) => milestone.id === id)) && Boolean(submission && typeof submission === "object" && validUrl(submission.repository) && validUrl(submission.deployment) && typeof (submission.notes || "") === "string" && (submission.notes || "").length <= MAX_TEXT);
}

async function accessFor(userId: string, project: NonNullable<ReturnType<typeof findCourseProject>>) {
  const snapshot = await readServerProgress(userId);
  const course = findCourse(project.courseSlug);
  const completed = new Set(snapshot.progressRecords.filter((record) => record.completed).map((record) => `${record.courseId}/${record.unitId}/${record.lessonId}`));
  return { status: projectStatus(project, course, completed, snapshot.minorProjectSubmissions[project.slug]), prerequisiteUnitIds: project.prerequisiteUnitIds, insertAfterModule: project.insertAfterModule };
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const project = findCourseProject(slug);
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ project, workspace: null, access: { status: "LOCKED", prerequisiteUnitIds: project.prerequisiteUnitIds, insertAfterModule: project.insertAfterModule } }, { headers: publicCourseHeaders });
  try {
    return Response.json({ project, workspace: await readProjectWorkspace(user.userId, slug), access: await accessFor(user.userId, project) }, { headers: privateHeaders });
  } catch { return Response.json({ error: "Project workspace is temporarily unavailable" }, { status: 503 }); }
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const project = findCourseProject(slug);
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  try {
    const access = await accessFor(user.userId, project);
    if (access.status === "LOCKED") return Response.json({ error: "Complete the prerequisite modules before opening this project", access }, { status: 403 });
    const raw = await request.text();
    if (raw.length > MAX_TEXT) return Response.json({ error: "Project workspace is too large" }, { status: 413 });
    const workspace = JSON.parse(raw) as unknown;
    if (!validWorkspace(workspace, project)) return Response.json({ error: "Invalid project workspace" }, { status: 400 });
    await saveProjectWorkspace(user, slug, { ...emptyProjectWorkspace(), ...workspace });
    return Response.json({ ok: true }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof SyntaxError) return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
    return Response.json({ error: "Project workspace could not be saved" }, { status: 503 });
  }
}
