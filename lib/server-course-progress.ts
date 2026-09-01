import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { learnerRecords, users } from "@/db/schema";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import type { EnrollmentRecord, ProgressRecord, ProgressSnapshot } from "@/lib/progress";

const emptySnapshot = (): ProgressSnapshot => ({
  progressRecords: [], quizScores: {}, quizDrafts: {}, projectSubmissions: {}, minorProjectSubmissions: {}, enrollments: {}, lessonNotes: {}, lastLesson: null,
});

export async function readServerProgress(userId: string): Promise<ProgressSnapshot> {
  const rows = await (await getDb()).select({ payload: learnerRecords.payload }).from(learnerRecords)
    .where(and(eq(learnerRecords.userId, userId), eq(learnerRecords.kind, "course-progress"))).limit(1);
  if (!rows[0]) return emptySnapshot();
  try {
    const value = JSON.parse(rows[0].payload) as Partial<ProgressSnapshot>;
    return { ...emptySnapshot(), ...value, progressRecords: Array.isArray(value.progressRecords) ? value.progressRecords : [], minorProjectSubmissions: value.minorProjectSubmissions && typeof value.minorProjectSubmissions === "object" ? value.minorProjectSubmissions : {}, enrollments: value.enrollments && typeof value.enrollments === "object" ? value.enrollments : {} };
  } catch {
    return emptySnapshot();
  }
}

export async function writeServerProgress(user: ChatGPTUser, snapshot: ProgressSnapshot) {
  const now = new Date().toISOString();
  const db = await getDb();
  await db.insert(users).values({ id: user.userId, email: user.email, displayName: user.displayName, updatedAt: now })
    .onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, updatedAt: now } });
  await db.insert(learnerRecords).values({ userId: user.userId, kind: "course-progress", version: 3, payload: JSON.stringify(snapshot), updatedAt: now })
    .onConflictDoUpdate({ target: [learnerRecords.userId, learnerRecords.kind], set: { version: 3, payload: JSON.stringify(snapshot), updatedAt: now } });
}

export function enrollment(courseId: string, snapshot: ProgressSnapshot): EnrollmentRecord {
  const existing = snapshot.enrollments[courseId];
  if (existing) return existing;
  const now = new Date().toISOString();
  return { courseId, enrolledAt: now, updatedAt: now };
}

export { progressForCourse } from "@/lib/course-progress";

export function upsertLessonProgress(snapshot: ProgressSnapshot, courseId: string, unitId: string, lessonId: string, completed: boolean, userId: string) {
  const now = new Date().toISOString();
  const index = snapshot.progressRecords.findIndex((record) => record.courseId === courseId && record.unitId === unitId && record.lessonId === lessonId);
  const previous = index >= 0 ? snapshot.progressRecords[index] : undefined;
  const record: ProgressRecord = { courseId, unitId, lessonId, completed, completedAt: completed ? previous?.completedAt ?? now : null, updatedAt: now, userId };
  if (index >= 0) snapshot.progressRecords[index] = record;
  else snapshot.progressRecords.push(record);
  snapshot.enrollments[courseId] = enrollment(courseId, snapshot);
}
