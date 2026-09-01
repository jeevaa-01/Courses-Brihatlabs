import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { certificateIdentities, certificateRecords, courseCertificationSettings, users } from "@/db/schema";
import { defaultCertificationSettings, type CertificateRecord, type CertificationSettings } from "@/lib/certification";

function settingsFromRow(row: typeof courseCertificationSettings.$inferSelect | undefined): CertificationSettings {
  if (!row) return defaultCertificationSettings;
  return {
    enabled: Boolean(row.enabled),
    requiredCompletionPercentage: 100,
    eligibilityRule: "all-required-items",
    templateId: row.templateId,
    templateVersion: row.templateVersion,
    issuerName: row.issuerName,
    issuerTitle: row.issuerTitle,
    verificationEnabled: Boolean(row.verificationEnabled),
    pdfEnabled: Boolean(row.pdfEnabled),
    pngEnabled: Boolean(row.pngEnabled),
  };
}

export async function readCertificationSettings(courseId: string) {
  const rows = await (await getDb()).select().from(courseCertificationSettings).where(eq(courseCertificationSettings.courseId, courseId)).limit(1);
  return settingsFromRow(rows[0]);
}

export async function readCertificationRecord(userId: string, courseId: string): Promise<CertificateRecord | null> {
  const rows = await (await getDb()).select().from(certificateRecords).where(and(eq(certificateRecords.userId, userId), eq(certificateRecords.courseId, courseId))).limit(1);
  const row = rows[0];
  if (!row) return null;
  return { ...row, status: row.status as CertificateRecord["status"] };
}

export async function readCertificateIdentity(userId: string, courseId: string) {
  const rows = await (await getDb()).select().from(certificateIdentities).where(and(eq(certificateIdentities.userId, userId), eq(certificateIdentities.courseId, courseId))).limit(1);
  return rows[0] || null;
}

export async function saveCertificateIdentity(user: { userId: string; email: string; displayName: string }, courseId: string, displayName: string) {
  const now = new Date().toISOString();
  const db = await getDb();
  await db.insert(users).values({ id: user.userId, email: user.email, displayName: user.displayName, updatedAt: now }).onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, updatedAt: now } });
  await db.insert(certificateIdentities).values({ userId: user.userId, courseId, displayName, confirmedAt: now, updatedAt: now }).onConflictDoUpdate({ target: [certificateIdentities.userId, certificateIdentities.courseId], set: { displayName, updatedAt: now } });
  return { displayName, confirmedAt: now };
}

export async function readPublicCertificate(credentialId: string) {
  const rows = await (await getDb()).select().from(certificateRecords).where(eq(certificateRecords.credentialId, credentialId)).limit(1);
  const record = rows[0];
  if (!record) return null;
  const settings = await readCertificationSettings(record.courseId);
  if (!settings.verificationEnabled) return null;
  return { credentialId: record.credentialId, status: record.status as CertificateRecord["status"], valid: record.status === "ISSUED", recipientDisplayName: record.recipientDisplayName, courseTitle: record.courseTitle, issuerName: settings.issuerName, issuerTitle: settings.issuerTitle, issuedAt: record.issuedAt, courseVersion: record.courseVersionSnapshot, templateVersion: record.templateVersion };
}
