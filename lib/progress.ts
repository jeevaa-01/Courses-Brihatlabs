export const PROGRESS_KEY = "agentlab-progress-v3";
const LEGACY_PROGRESS_KEY = "agentlab-progress-v2";
export const LAST_LESSON_KEY = "agentlab-last-lesson-v2";
export const QUIZ_SCORES_KEY = "agentlab-quiz-scores-v2";
export const QUIZ_DRAFTS_KEY = "agentlab-quiz-drafts-v1";
export const PROJECT_SUBMISSIONS_KEY = "agentlab-project-submissions-v1";
export const MINOR_PROJECT_SUBMISSIONS_KEY = "agentlab-minor-project-submissions-v1";
export const ENROLLMENTS_KEY = "agentlab-enrollments-v1";
export const LESSON_NOTES_KEY = "agentlab-lesson-notes-v1";
export const LESSON_SCROLL_KEY = "agentlab-lesson-scroll-v1";

export type QuizScore = {
  courseId: string;
  unitId: string;
  lessonId: string;
  score: number;
  total: number;
  percentage: number;
  answers?: Record<string, number>;
  updatedAt: string;
};

export type QuizDraft = {
  courseId: string;
  unitId: string;
  lessonId: string;
  answers: Record<string, number>;
  questionIndex: number;
  updatedAt: string;
};

export type ProjectSubmission = {
  courseId: string;
  unitId: string;
  lessonId: string;
  notes: string;
  status: "draft" | "submitted";
  updatedAt: string;
  submittedAt: string | null;
};

export type MinorProjectSubmission = {
  projectSlug: string;
  courseId: string;
  status: "in_progress" | "submitted" | "completed";
  notes: string;
  updatedAt: string;
  submittedAt: string | null;
};

export type LastLesson = { courseSlug: string; unitId: string; lessonId: string };

export type EnrollmentRecord = {
  courseId: string;
  enrolledAt: string;
  updatedAt: string;
};

export type LessonNote = {
  courseId: string;
  unitId: string;
  lessonId: string;
  text: string;
  updatedAt: string;
};

export type ProgressRecord = {
  courseId: string;
  unitId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  updatedAt: string;
  userId: string;
};

export type ProgressSnapshot = {
  progressRecords: ProgressRecord[];
  quizScores: Record<string, QuizScore>;
  quizDrafts: Record<string, QuizDraft>;
  projectSubmissions: Record<string, ProjectSubmission>;
  minorProjectSubmissions: Record<string, MinorProjectSubmission>;
  enrollments: Record<string, EnrollmentRecord>;
  lessonNotes: Record<string, LessonNote>;
  lastLesson: LastLesson | null;
};

export interface ProgressStore {
  read(userId: string): ProgressRecord[];
  setCompletion(userId: string, courseId: string, unitId: string, lessonId: string, completed: boolean): ProgressRecord[];
}

function storageKey(base: string, userId: string) {
  return `${base}:${encodeURIComponent(userId || "anonymous")}`;
}

function notify() {
  window.dispatchEvent(new Event("agentlab-progress"));
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeModuleId(unitId: string) {
  const legacy = unitId.match(/^unit-(\d+)$/);
  return legacy ? `module-${Number(legacy[1]) + 1}` : unitId;
}

function isProgressRecord(value: unknown): value is ProgressRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<ProgressRecord>;
  return typeof record.courseId === "string" && typeof record.unitId === "string" && typeof record.lessonId === "string" && typeof record.completed === "boolean";
}

function migrateLegacyProgress(userId: string): ProgressRecord[] {
  const legacy = readJson<unknown>(LEGACY_PROGRESS_KEY, []);
  if (!Array.isArray(legacy) || !legacy.every(isProgressRecord)) return [];
  const migrated = legacy.map((record) => ({ ...record, unitId: normalizeModuleId(record.unitId), userId }));
  if (migrated.length) {
    writeJson(storageKey(PROGRESS_KEY, userId), migrated);
    localStorage.removeItem(LEGACY_PROGRESS_KEY);
  }
  return migrated;
}

export function readProgressRecords(userId: string): ProgressRecord[] {
  if (typeof window === "undefined") return [];
  const key = storageKey(PROGRESS_KEY, userId);
  const stored = readJson<unknown>(key, []);
  if (Array.isArray(stored) && stored.every(isProgressRecord) && stored.length) {
    const normalized = stored.map((record) => ({ ...record, unitId: normalizeModuleId(record.unitId), userId }));
    if (normalized.some((record, index) => record.unitId !== stored[index].unitId || record.userId !== stored[index].userId)) writeJson(key, normalized);
    return normalized;
  }
  return migrateLegacyProgress(userId);
}

export function readCompleted(userId: string): string[] {
  return readProgressRecords(userId).filter((record) => record.completed).map((record) => lessonKey(record.courseId, record.unitId, record.lessonId));
}

export const localProgressStore: ProgressStore = {
  read: readProgressRecords,
  setCompletion(userId, courseId, unitId, lessonId, completed) {
    const records = readProgressRecords(userId);
    const now = new Date().toISOString();
    const existingIndex = records.findIndex((record) => record.courseId === courseId && record.unitId === unitId && record.lessonId === lessonId);
    const existing = existingIndex >= 0 ? records[existingIndex] : null;
    const nextRecord: ProgressRecord = { courseId, unitId, lessonId, completed, completedAt: completed ? existing?.completedAt || now : null, updatedAt: now, userId };
    const next = existingIndex >= 0 ? records.map((record, index) => index === existingIndex ? nextRecord : record) : [...records, nextRecord];
    writeJson(storageKey(PROGRESS_KEY, userId), next);
    notify();
    return next;
  },
};

export function setLessonCompletion(userId: string, courseId: string, unitId: string, lessonId: string, completed: boolean) {
  return localProgressStore.setCompletion(userId, courseId, unitId, lessonId, completed);
}

export function lessonKey(courseId: string, unitId: string, lessonId: string) {
  return `${courseId}/${unitId}/${lessonId}`;
}

export function readQuizScores(userId: string): Record<string, QuizScore> {
  if (typeof window === "undefined") return {};
  return readJson(storageKey(QUIZ_SCORES_KEY, userId), {});
}

export function writeQuizScore(userId: string, score: QuizScore) {
  const scores = readQuizScores(userId);
  scores[lessonKey(score.courseId, score.unitId, score.lessonId)] = score;
  writeJson(storageKey(QUIZ_SCORES_KEY, userId), scores);
  notify();
}

export function readQuizDrafts(userId: string): Record<string, QuizDraft> {
  if (typeof window === "undefined") return {};
  return readJson(storageKey(QUIZ_DRAFTS_KEY, userId), {});
}

export function writeQuizDraft(userId: string, draft: QuizDraft) {
  const drafts = readQuizDrafts(userId);
  drafts[lessonKey(draft.courseId, draft.unitId, draft.lessonId)] = draft;
  writeJson(storageKey(QUIZ_DRAFTS_KEY, userId), drafts);
  notify();
}

export function clearQuizDraft(userId: string, courseId: string, unitId: string, lessonId: string) {
  const drafts = readQuizDrafts(userId);
  delete drafts[lessonKey(courseId, unitId, lessonId)];
  writeJson(storageKey(QUIZ_DRAFTS_KEY, userId), drafts);
  notify();
}

export function readProjectSubmissions(userId: string): Record<string, ProjectSubmission> {
  if (typeof window === "undefined") return {};
  return readJson(storageKey(PROJECT_SUBMISSIONS_KEY, userId), {});
}

export function readMinorProjectSubmissions(userId: string): Record<string, MinorProjectSubmission> {
  if (typeof window === "undefined") return {};
  return readJson(storageKey(MINOR_PROJECT_SUBMISSIONS_KEY, userId), {});
}

export function writeMinorProjectSubmission(userId: string, submission: MinorProjectSubmission) {
  const submissions = readMinorProjectSubmissions(userId);
  const existing = submissions[submission.projectSlug];
  if (existing?.status === "completed" && submission.status !== "completed") return existing;
  submissions[submission.projectSlug] = submission;
  writeJson(storageKey(MINOR_PROJECT_SUBMISSIONS_KEY, userId), submissions);
  notify();
  return submission;
}

export function writeProjectSubmission(userId: string, submission: ProjectSubmission) {
  const submissions = readProjectSubmissions(userId);
  const key = lessonKey(submission.courseId, submission.unitId, submission.lessonId);
  if (submissions[key]?.status === "submitted" && submission.status === "submitted") return submissions[key];
  submissions[key] = submission;
  writeJson(storageKey(PROJECT_SUBMISSIONS_KEY, userId), submissions);
  notify();
  return submission;
}

export function readEnrollments(userId: string): Record<string, EnrollmentRecord> {
  if (typeof window === "undefined") return {};
  return readJson(storageKey(ENROLLMENTS_KEY, userId), {});
}

export function enrollInCourse(userId: string, courseId: string) {
  const enrollments = readEnrollments(userId);
  if (enrollments[courseId]) return enrollments[courseId];
  const now = new Date().toISOString();
  const enrollment = { courseId, enrolledAt: now, updatedAt: now };
  enrollments[courseId] = enrollment;
  writeJson(storageKey(ENROLLMENTS_KEY, userId), enrollments);
  notify();
  return enrollment;
}

export function readLessonNotes(userId: string): Record<string, LessonNote> {
  if (typeof window === "undefined") return {};
  return readJson(storageKey(LESSON_NOTES_KEY, userId), {});
}

export function writeLessonNote(userId: string, note: LessonNote) {
  const notes = readLessonNotes(userId);
  notes[lessonKey(note.courseId, note.unitId, note.lessonId)] = { ...note, text: note.text.slice(0, 20_000) };
  writeJson(storageKey(LESSON_NOTES_KEY, userId), notes);
  notify();
}

export function readLessonScroll(userId: string, courseId: string, unitId: string, lessonId: string) {
  if (typeof window === "undefined") return 0;
  const positions = readJson<Record<string, number>>(storageKey(LESSON_SCROLL_KEY, userId), {});
  return Math.max(0, Number(positions[lessonKey(courseId, unitId, lessonId)]) || 0);
}

export function writeLessonScroll(userId: string, courseId: string, unitId: string, lessonId: string, position: number) {
  const positions = readJson<Record<string, number>>(storageKey(LESSON_SCROLL_KEY, userId), {});
  positions[lessonKey(courseId, unitId, lessonId)] = Math.max(0, Math.round(position));
  writeJson(storageKey(LESSON_SCROLL_KEY, userId), positions);
}

export function readLastLesson(userId: string): LastLesson | null {
  if (typeof window === "undefined") return null;
  return readJson(storageKey(LAST_LESSON_KEY, userId), null);
}

export function writeLastLesson(userId: string, lesson: LastLesson) {
  writeJson(storageKey(LAST_LESSON_KEY, userId), lesson);
  notify();
}

export function exportProgressSnapshot(userId: string): ProgressSnapshot {
  return {
    progressRecords: readProgressRecords(userId),
    quizScores: readQuizScores(userId),
    quizDrafts: readQuizDrafts(userId),
    projectSubmissions: readProjectSubmissions(userId),
    minorProjectSubmissions: readMinorProjectSubmissions(userId),
    enrollments: readEnrollments(userId),
    lessonNotes: readLessonNotes(userId),
    lastLesson: readLastLesson(userId),
  };
}

export function importProgressSnapshot(userId: string, snapshot: Partial<ProgressSnapshot>) {
  if (typeof window === "undefined" || !snapshot || typeof snapshot !== "object") return;
  if (Array.isArray(snapshot.progressRecords) && snapshot.progressRecords.every(isProgressRecord)) {
    const local = readProgressRecords(userId);
    const merged = new Map(local.map((record) => [lessonKey(record.courseId, record.unitId, record.lessonId), record]));
    for (const record of snapshot.progressRecords) {
      const key = lessonKey(record.courseId, record.unitId, record.lessonId);
      const existing = merged.get(key);
      if (!existing || record.updatedAt > existing.updatedAt) merged.set(key, { ...record, userId });
    }
    writeJson(storageKey(PROGRESS_KEY, userId), [...merged.values()]);
  }
  if (snapshot.quizScores && typeof snapshot.quizScores === "object") writeJson(storageKey(QUIZ_SCORES_KEY, userId), snapshot.quizScores);
  if (snapshot.quizDrafts && typeof snapshot.quizDrafts === "object") writeJson(storageKey(QUIZ_DRAFTS_KEY, userId), snapshot.quizDrafts);
  if (snapshot.projectSubmissions && typeof snapshot.projectSubmissions === "object") writeJson(storageKey(PROJECT_SUBMISSIONS_KEY, userId), snapshot.projectSubmissions);
  if (snapshot.minorProjectSubmissions && typeof snapshot.minorProjectSubmissions === "object") writeJson(storageKey(MINOR_PROJECT_SUBMISSIONS_KEY, userId), snapshot.minorProjectSubmissions);
  if (snapshot.enrollments && typeof snapshot.enrollments === "object") {
    const local = readEnrollments(userId);
    const merged = { ...snapshot.enrollments, ...local };
    for (const [courseId, remote] of Object.entries(snapshot.enrollments)) {
      const existing = local[courseId];
      if (!existing || remote.updatedAt > existing.updatedAt) merged[courseId] = remote;
    }
    writeJson(storageKey(ENROLLMENTS_KEY, userId), merged);
  }
  if (snapshot.lessonNotes && typeof snapshot.lessonNotes === "object") {
    const local = readLessonNotes(userId);
    const merged = { ...snapshot.lessonNotes, ...local };
    for (const [key, remote] of Object.entries(snapshot.lessonNotes)) {
      const existing = local[key];
      if (!existing || remote.updatedAt > existing.updatedAt) merged[key] = remote;
    }
    writeJson(storageKey(LESSON_NOTES_KEY, userId), merged);
  }
  if (snapshot.lastLesson) writeJson(storageKey(LAST_LESSON_KEY, userId), snapshot.lastLesson);
  notify();
}
