import type { Course, Lesson } from "@/types/course";
import { courseProjectsFor, projectStatus, type CourseProject } from "@/lib/course-projects";
import type { ProgressSnapshot } from "@/lib/progress";

export const CERTIFICATION_STATUS = {
  LOCKED: "LOCKED",
  ELIGIBLE_TEMPLATE_PENDING: "ELIGIBLE_TEMPLATE_PENDING",
  READY_TO_GENERATE: "READY_TO_GENERATE",
  GENERATING: "GENERATING",
  ISSUED: "ISSUED",
  GENERATION_FAILED: "GENERATION_FAILED",
  REVOKED: "REVOKED",
} as const;

export type CertificationStatus = typeof CERTIFICATION_STATUS[keyof typeof CERTIFICATION_STATUS];
export type CertificationRequirement = { id: string; type: "lesson" | "assessment" | "project"; title: string; href: string; complete: boolean; detail?: string };
export type CertificationSettings = { enabled: boolean; requiredCompletionPercentage: 100; eligibilityRule: "all-required-items"; templateId: string | null; templateVersion: string | null; issuerName: string; issuerTitle: string | null; verificationEnabled: boolean; pdfEnabled: boolean; pngEnabled: boolean };
export type CertificateRecord = { id: string; userId: string; courseId: string; status: CertificationStatus; recipientDisplayName: string; courseTitle: string; credentialId: string; verificationCode: string; courseVersionSnapshot: string; progressSnapshot: string; completedRequiredItemsSnapshot: number; totalRequiredItemsSnapshot: number; eligibilityVerifiedAt: string; eligibleAt: string | null; issuedAt: string | null; templateId: string | null; templateVersion: string | null; pdfStoragePath: string | null; pngStoragePath: string | null; metadataSnapshot: string; contentHash: string | null; revokedAt: string | null; revocationReason: string | null };
export type CertificationEligibility = { status: CertificationStatus; enabled: boolean; enrolled: boolean; percentage: number; completedRequiredItems: number; totalRequiredItems: number; requiredLessons: number; completedLessons: number; requiredProjects: number; completedProjects: number; requiredAssessments: number; passedAssessments: number; missingRequirements: CertificationRequirement[]; reason: "NOT_ENROLLED" | "INCOMPLETE_REQUIREMENTS" | "NO_REQUIRED_ITEMS" | "TEMPLATE_PENDING" | "READY" | "ISSUED" | "REVOKED" | "DISABLED" };
export type CertificateTemplateData = { credentialId: string; recipientDisplayName: string; courseTitle: string; issuerName: string; issuerTitle: string | null; issuedAt: string; verificationUrl: string; courseVersion: string; completedRequiredItems: number; totalRequiredItems: number };

export const defaultCertificationSettings: CertificationSettings = { enabled: true, requiredCompletionPercentage: 100, eligibilityRule: "all-required-items", templateId: null, templateVersion: null, issuerName: "AgentLab", issuerTitle: null, verificationEnabled: true, pdfEnabled: false, pngEnabled: false };

function lessonKey(courseId: string, unitId: string, lessonId: string) { return `${courseId}/${unitId}/${lessonId}`; }
function lessonHref(courseSlug: string, unitId: string, lessonId: string) { return `/learn/${courseSlug}/${unitId}/${lessonId}`; }

function requirementForLesson(course: Course, unitId: string, lesson: Lesson, complete: boolean): CertificationRequirement {
  const type = lesson.type === "quiz" ? "assessment" : "lesson";
  return { id: lessonKey(course.id, unitId, lesson.id), type, title: lesson.type === "quiz" ? `${lesson.title} assessment` : lesson.title, href: lessonHref(course.slug, unitId, lesson.id), complete };
}

export function normalizeCertificateName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/gu, " ");
  return normalized.length >= 2 && normalized.length <= 160 ? normalized : null;
}

export function getCertificationEligibility(course: Course, snapshot: ProgressSnapshot, settings: CertificationSettings = defaultCertificationSettings, existing?: Pick<CertificateRecord, "status"> | null): CertificationEligibility {
  const lessons = course.units.flatMap((unit) => unit.lessons.map((lesson) => ({ unitId: unit.id, lesson })));
  const completedRecords = new Set(snapshot.progressRecords.filter((record) => record.courseId === course.id && record.completed).map((record) => lessonKey(course.id, record.unitId, record.lessonId)));
  const requiredLessons = lessons.filter(({ lesson }) => lesson.type !== "quiz");
  const assessments = lessons.filter(({ lesson }) => lesson.type === "quiz");
  const passedAssessments = assessments.filter(({ unitId, lesson }) => completedRecords.has(lessonKey(course.id, unitId, lesson.id)) && (snapshot.quizScores[lessonKey(course.id, unitId, lesson.id)]?.percentage ?? 0) >= 60);
  const lessonRequirements = lessons.map(({ unitId, lesson }) => requirementForLesson(course, unitId, lesson, lesson.type === "quiz" ? passedAssessments.some((item) => item.lesson.id === lesson.id && item.unitId === unitId) : completedRecords.has(lessonKey(course.id, unitId, lesson.id))));
  const completedKeys = new Set(snapshot.progressRecords.filter((record) => record.completed).map((record) => lessonKey(record.courseId, record.unitId, record.lessonId)));
  const projects = courseProjectsFor(course);
  const projectRequirements = projects.map((project) => ({ id: project.slug, type: "project" as const, title: `Project ${String(project.position).padStart(2, "0")}: ${project.title}`, href: `/learn/${course.slug}/project/${project.slug}`, complete: projectStatus(project, course, completedKeys, snapshot.minorProjectSubmissions?.[project.slug]) === "COMPLETED", detail: `Complete after Modules 01–${project.insertAfterModule}` }));
  const requirements = [...lessonRequirements, ...projectRequirements];
  const completedRequiredItems = requirements.filter((item) => item.complete).length;
  const totalRequiredItems = requirements.length;
  const enrolled = Boolean(snapshot.enrollments[course.id]);
  const exactComplete = totalRequiredItems > 0 && completedRequiredItems === totalRequiredItems && passedAssessments.length === assessments.length;
  const missingRequirements = requirements.filter((item) => !item.complete);
  let status: CertificationStatus = CERTIFICATION_STATUS.LOCKED;
  let reason: CertificationEligibility["reason"] = "INCOMPLETE_REQUIREMENTS";
  if (!settings.enabled) reason = "DISABLED";
  else if (!enrolled) reason = "NOT_ENROLLED";
  else if (!totalRequiredItems) reason = "NO_REQUIRED_ITEMS";
  else if (existing?.status === CERTIFICATION_STATUS.REVOKED) { status = CERTIFICATION_STATUS.REVOKED; reason = "REVOKED"; }
  else if (existing?.status === CERTIFICATION_STATUS.ISSUED) { status = CERTIFICATION_STATUS.ISSUED; reason = "ISSUED"; }
  else if (!exactComplete) reason = "INCOMPLETE_REQUIREMENTS";
  else if (!settings.templateId) { status = CERTIFICATION_STATUS.ELIGIBLE_TEMPLATE_PENDING; reason = "TEMPLATE_PENDING"; }
  else { status = CERTIFICATION_STATUS.READY_TO_GENERATE; reason = "READY"; }
  return { status, enabled: settings.enabled, enrolled, percentage: totalRequiredItems ? Math.floor((completedRequiredItems * 100) / totalRequiredItems) : 0, completedRequiredItems, totalRequiredItems, requiredLessons: requiredLessons.length, completedLessons: lessonRequirements.filter((item) => item.complete && item.type === "lesson").length, requiredProjects: projects.length, completedProjects: projectRequirements.filter((item) => item.complete).length, requiredAssessments: assessments.length, passedAssessments: passedAssessments.length, missingRequirements, reason };
}

export function buildCertificateTemplateData(course: Course, record: Pick<CertificateRecord, "credentialId" | "recipientDisplayName" | "issuedAt" | "courseVersionSnapshot" | "completedRequiredItemsSnapshot" | "totalRequiredItemsSnapshot">, settings: CertificationSettings, verificationOrigin = "") : CertificateTemplateData {
  const issuedAt = record.issuedAt || new Date().toISOString();
  return { credentialId: record.credentialId, recipientDisplayName: record.recipientDisplayName, courseTitle: course.title, issuerName: settings.issuerName, issuerTitle: settings.issuerTitle, issuedAt, verificationUrl: `${verificationOrigin}/verify/${encodeURIComponent(record.credentialId)}`, courseVersion: record.courseVersionSnapshot, completedRequiredItems: record.completedRequiredItemsSnapshot, totalRequiredItems: record.totalRequiredItemsSnapshot };
}

export function generateCredentialId(random = crypto.randomUUID()): string { return `AGL-${random.replace(/[^a-z0-9]/giu, "").slice(0, 20).toUpperCase()}`; }
export function generateVerificationCode(random = crypto.randomUUID()): string { return random.replace(/[^a-z0-9]/giu, "").slice(0, 24).toUpperCase(); }

export type CertificateTemplateRenderer = (data: CertificateTemplateData) => Promise<{ pdfStoragePath?: string; pngStoragePath?: string; contentHash: string }>;
export type { CourseProject };
