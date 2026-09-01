import { findCourseProject, projectStatus } from "../../../../../lib/course-projects";
import { findCourse } from "../../../../../lib/course-data";
import { readServerProgress, writeServerProgress } from "../../../../../lib/server-course-progress";
import { projectCompletionIssues, readProjectWorkspace, saveProjectWorkspace, workspaceForCompletion } from "../../../../../lib/project-workspace";
import { getChatGPTUser } from "../../../../chatgpt-auth";
import { privateHeaders } from "../../../../../lib/http";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  const { slug } = await context.params;
  const project = findCourseProject(slug);
  if (!project) return Response.json({ error: "Course project not found" }, { status: 404 });
  try {
    const snapshot = await readServerProgress(user.userId);
    const course = findCourse(project.courseSlug);
    const completed = new Set(snapshot.progressRecords.filter((record) => record.completed).map((record) => `${record.courseId}/${record.unitId}/${record.lessonId}`));
    const current = snapshot.minorProjectSubmissions[slug];
    const access = projectStatus(project, course, completed, current);
    if (access === "LOCKED") return Response.json({ error: "Complete the prerequisite modules before completing this project", access }, { status: 403 });
    const raw = await request.text();
    if (raw.length > 20_000) return Response.json({ error: "Request body is too large" }, { status: 413 });
    let input: unknown = {};
    if (raw.trim()) {
      try { input = JSON.parse(raw); } catch { return Response.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
    }
    const workspace = workspaceForCompletion(project, await readProjectWorkspace(user.userId, slug), input);
    const issues = projectCompletionIssues(project, workspace);
    if (issues.length) return Response.json({ error: "Project evidence is incomplete", issues }, { status: 409 });
    await saveProjectWorkspace(user, slug, workspace);
    const now = new Date().toISOString();
    snapshot.minorProjectSubmissions[slug] = { projectSlug: slug, courseId: project.courseId, status: "completed", notes: workspace.submission.notes || "", updatedAt: now, submittedAt: current?.submittedAt || now };
    await writeServerProgress(user, snapshot);
    return Response.json({ ok: true, status: "COMPLETED", projectSlug: slug }, { headers: privateHeaders });
  } catch {
    return Response.json({ error: "Project completion could not be saved" }, { status: 503 });
  }
}
