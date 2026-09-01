import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { learnerRecords, users } from "@/db/schema";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import type { CourseProject } from "@/lib/course-projects";
export type ProjectSubmission = { repository?: string; deployment?: string; notes?: string };
export type ProjectWorkspace = { milestones: string[]; decisions: Record<string, string>; submission: ProjectSubmission };

type WorkspaceRecord = Record<string, ProjectWorkspace>;

export function emptyProjectWorkspace(): ProjectWorkspace {
  return { milestones: [], decisions: {}, submission: { repository: "", deployment: "", notes: "" } };
}

export async function readProjectWorkspace(userId: string, slug: string): Promise<ProjectWorkspace | null> {
  const rows = await (await getDb()).select({ payload: learnerRecords.payload }).from(learnerRecords)
    .where(and(eq(learnerRecords.userId, userId), eq(learnerRecords.kind, "project-workspace"))).limit(1);
  if (!rows[0]) return null;
  try {
    const all = JSON.parse(rows[0].payload) as WorkspaceRecord;
    return all[slug] ?? null;
  } catch {
    return null;
  }
}

export async function saveProjectWorkspace(user: ChatGPTUser, slug: string, workspace: ProjectWorkspace) {
  const db = await getDb();
  const rows = await db.select({ payload: learnerRecords.payload }).from(learnerRecords)
    .where(and(eq(learnerRecords.userId, user.userId), eq(learnerRecords.kind, "project-workspace"))).limit(1);
  let all: WorkspaceRecord = {};
  try { if (rows[0]) all = JSON.parse(rows[0].payload) as WorkspaceRecord; } catch { all = {}; }
  const now = new Date().toISOString();
  await db.insert(users).values({ id: user.userId, email: user.email, displayName: user.displayName, updatedAt: now })
    .onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, updatedAt: now } });
  await db.insert(learnerRecords).values({ userId: user.userId, kind: "project-workspace", version: 2, payload: JSON.stringify({ ...all, [slug]: workspace }), updatedAt: now })
    .onConflictDoUpdate({ target: [learnerRecords.userId, learnerRecords.kind], set: { version: 2, payload: JSON.stringify({ ...all, [slug]: workspace }), updatedAt: now } });
}

export function projectCompletionIssues(project: CourseProject, workspace: ProjectWorkspace | null) {
  if (!workspace) return ["Save a project workspace before completing this milestone."];
  const completed = new Set(workspace.milestones);
  const issues = project.milestones.filter((milestone) => !completed.has(milestone.id)).map((milestone) => `Complete milestone: ${milestone.title}`);
  const submission = workspace.submission ?? {};
  const hasEvidence = Boolean(submission.repository?.trim() || submission.deployment?.trim() || (submission.notes?.trim().length ?? 0) >= 40);
  if (!hasEvidence) issues.push("Add a repository, deployment URL, or at least 40 characters of evidence notes.");
  return issues;
}

export function workspaceForCompletion(project: CourseProject, current: ProjectWorkspace | null, input: unknown): ProjectWorkspace {
  const body = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const submission = body.submission && typeof body.submission === "object" ? body.submission as Record<string, unknown> : {};
  const milestones = Array.isArray(body.milestonesCompleted) ? body.milestonesCompleted : current?.milestones ?? [];
  return {
    ...(current ?? emptyProjectWorkspace()),
    milestones: milestones.filter((id): id is string => typeof id === "string" && project.milestones.some((milestone) => milestone.id === id)),
    submission: {
      ...(current?.submission ?? emptyProjectWorkspace().submission),
      repository: typeof body.repository === "string" ? body.repository : typeof submission.repository === "string" ? submission.repository : current?.submission.repository ?? "",
      deployment: typeof body.deployment === "string" ? body.deployment : typeof submission.deployment === "string" ? submission.deployment : current?.submission.deployment ?? "",
      notes: typeof body.notes === "string" ? body.notes : typeof submission.notes === "string" ? submission.notes : current?.submission.notes ?? "",
    },
  };
}
