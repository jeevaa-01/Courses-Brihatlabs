"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  clearQuizDraft, enrollInCourse, exportProgressSnapshot, importProgressSnapshot, lessonKey, readCompleted, readEnrollments, readLastLesson, readLessonNotes, readProgressRecords, readMinorProjectSubmissions, readProjectSubmissions, readQuizDrafts, readQuizScores,
  setLessonCompletion, writeLessonNote, writeMinorProjectSubmission, writeProjectSubmission, writeQuizDraft, writeQuizScore,
  type EnrollmentRecord, type LessonNote, type MinorProjectSubmission, type ProgressRecord, type ProjectSubmission, type QuizDraft, type QuizScore,
} from "../lib/progress";

export type Viewer = { id: string; email: string; displayName: string } | null;

type ProgressContextValue = {
  viewer: Viewer;
  viewerId: string;
  ready: boolean;
  completed: string[];
  progressRecords: ProgressRecord[];
  quizScores: Record<string, QuizScore>;
  quizDrafts: Record<string, QuizDraft>;
  projectSubmissions: Record<string, ProjectSubmission>;
  minorProjectSubmissions: Record<string, MinorProjectSubmission>;
  enrollments: Record<string, EnrollmentRecord>;
  lessonNotes: Record<string, LessonNote>;
  lastLesson: ReturnType<typeof readLastLesson>;
  syncState: "idle" | "saving" | "saved" | "error";
  toggleLesson: (courseId: string, unitId: string, lessonId: string, force?: boolean) => void;
  isComplete: (courseId: string, unitId: string, lessonId: string) => boolean;
  saveQuizScore: (score: QuizScore) => void;
  saveQuizDraft: (draft: QuizDraft) => void;
  removeQuizDraft: (courseId: string, unitId: string, lessonId: string) => void;
  saveProjectSubmission: (submission: ProjectSubmission) => void;
  saveMinorProjectSubmission: (submission: MinorProjectSubmission) => void;
  enrollCourse: (courseId: string) => void;
  saveLessonNote: (note: LessonNote) => void;
  retrySync: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function Providers({ children, viewer }: { children: React.ReactNode; viewer: Viewer }) {
  const viewerId = viewer?.id || "signed-out-preview";
  const [completed, setCompleted] = useState<string[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, QuizScore>>({});
  const [quizDrafts, setQuizDrafts] = useState<Record<string, QuizDraft>>({});
  const [projectSubmissions, setProjectSubmissions] = useState<Record<string, ProjectSubmission>>({});
  const [minorProjectSubmissions, setMinorProjectSubmissions] = useState<Record<string, MinorProjectSubmission>>({});
  const [enrollments, setEnrollments] = useState<Record<string, EnrollmentRecord>>({});
  const [lessonNotes, setLessonNotes] = useState<Record<string, LessonNote>>({});
  const [lastLesson, setLastLesson] = useState<ReturnType<typeof readLastLesson>>(null);
  const [syncState, setSyncState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [ready, setReady] = useState(false);
  const syncTimer = useRef<number | null>(null);
  const savedTimer = useRef<number | null>(null);

  const sync = useCallback(() => {
    setCompleted(readCompleted(viewerId));
    setProgressRecords(readProgressRecords(viewerId));
    setQuizScores(readQuizScores(viewerId));
    setQuizDrafts(readQuizDrafts(viewerId));
    setProjectSubmissions(readProjectSubmissions(viewerId));
    setMinorProjectSubmissions(readMinorProjectSubmissions(viewerId));
    setEnrollments(readEnrollments(viewerId));
    setLessonNotes(readLessonNotes(viewerId));
    setLastLesson(readLastLesson(viewerId));
    setReady(true);
  }, [viewerId]);

  const syncRemote = useCallback(async () => {
    if (!viewer) return;
    setSyncState("saving");
    try {
      const response = await fetch("/api/learner-state", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "course-progress", version: 2, payload: exportProgressSnapshot(viewerId) }) });
      if (!response.ok) throw new Error("Progress sync failed");
      setSyncState("saved");
      if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(() => setSyncState("idle"), 2200);
    } catch {
      setSyncState("error");
    }
  }, [viewer, viewerId]);

  const queueRemoteSync = useCallback(() => {
    if (!viewer) return;
    setSyncState("saving");
    if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => void syncRemote(), 450);
  }, [syncRemote, viewer]);

  const persistCourseAction = useCallback((path: string, method: "POST" | "PATCH", body: Record<string, unknown>) => {
    if (!viewer) return;
    void fetch(path, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => undefined);
  }, [viewer]);

  useEffect(() => {
    sync();
    window.addEventListener("agentlab-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("agentlab-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  useEffect(() => () => {
    if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
    if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
  }, []);

  useEffect(() => {
    if (!viewer) return;
    let cancelled = false;
    fetch("/api/learner-state?kind=course-progress").then((response) => response.ok ? response.json() as Promise<{record?:{payload?:unknown}}> : null).then((data) => {
      if (!cancelled && data?.record?.payload) importProgressSnapshot(viewerId, data.record.payload);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [viewer, viewerId]);

  const toggleLesson = useCallback((courseId: string, unitId: string, lessonId: string, force?: boolean) => {
    const key = lessonKey(courseId, unitId, lessonId);
    const exists = completed.includes(key);
    setLessonCompletion(viewerId, courseId, unitId, lessonId, force ?? !exists);
    enrollInCourse(viewerId, courseId);
    persistCourseAction(`/api/lessons/${encodeURIComponent(lessonId)}/progress`, "PATCH", { courseId, unitId, completed: force ?? !exists });
    sync(); queueRemoteSync();
  }, [completed, persistCourseAction, queueRemoteSync, sync, viewerId]);

  const saveQuizScore = useCallback((score: QuizScore) => { writeQuizScore(viewerId, score); enrollInCourse(viewerId, score.courseId); sync(); queueRemoteSync(); }, [queueRemoteSync, sync, viewerId]);
  const saveQuizDraft = useCallback((draft: QuizDraft) => { writeQuizDraft(viewerId, draft); enrollInCourse(viewerId, draft.courseId); sync(); queueRemoteSync(); }, [queueRemoteSync, sync, viewerId]);
  const removeQuizDraft = useCallback((courseId: string, unitId: string, lessonId: string) => { clearQuizDraft(viewerId, courseId, unitId, lessonId); sync(); queueRemoteSync(); }, [queueRemoteSync, sync, viewerId]);
  const saveProjectSubmission = useCallback((submission: ProjectSubmission) => { writeProjectSubmission(viewerId, submission); enrollInCourse(viewerId, submission.courseId); sync(); queueRemoteSync(); }, [queueRemoteSync, sync, viewerId]);
  const saveMinorProjectSubmission = useCallback((submission: MinorProjectSubmission) => { writeMinorProjectSubmission(viewerId, submission); enrollInCourse(viewerId, submission.courseId); sync(); queueRemoteSync(); }, [queueRemoteSync, sync, viewerId]);
  const enrollCourse = useCallback((courseId: string) => { enrollInCourse(viewerId, courseId); persistCourseAction(`/api/courses/${encodeURIComponent(courseId)}/enroll`, "POST", {}); sync(); queueRemoteSync(); }, [persistCourseAction, queueRemoteSync, sync, viewerId]);
  const saveLessonNote = useCallback((note: LessonNote) => { writeLessonNote(viewerId, note); enrollInCourse(viewerId, note.courseId); sync(); queueRemoteSync(); }, [queueRemoteSync, sync, viewerId]);
  const retrySync = useCallback(() => { void syncRemote(); }, [syncRemote]);
  const value = useMemo(() => ({
    viewer, viewerId, ready, completed, progressRecords, quizScores, quizDrafts, projectSubmissions, minorProjectSubmissions, enrollments, lessonNotes, lastLesson, syncState,
    toggleLesson,
    isComplete: (courseId: string, unitId: string, lessonId: string) => completed.includes(lessonKey(courseId, unitId, lessonId)),
    saveQuizScore, saveQuizDraft, removeQuizDraft, saveProjectSubmission, saveMinorProjectSubmission, enrollCourse, saveLessonNote, retrySync,
  }), [viewer, viewerId, ready, completed, progressRecords, quizScores, quizDrafts, projectSubmissions, minorProjectSubmissions, enrollments, lessonNotes, lastLesson, syncState, toggleLesson, saveQuizScore, saveQuizDraft, removeQuizDraft, saveProjectSubmission, saveMinorProjectSubmission, enrollCourse, saveLessonNote, retrySync]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside Providers");
  return context;
}

export function useViewer() {
  return useProgress().viewer;
}
