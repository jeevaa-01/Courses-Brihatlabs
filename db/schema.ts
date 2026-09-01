import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/** Minimal persistence contract for the course integration module. */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("learner"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** One account-scoped record per workflow state kind. */
export const learnerRecords = sqliteTable("learner_records", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  version: integer("version").notNull().default(1),
  payload: text("payload").notNull().default("{}"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ columns: [table.userId, table.kind] }),
  index("idx_learner_records_user_updated").on(table.userId, table.updatedAt),
]);

/** Per-course certification policy. A missing row uses the safe application default. */
export const courseCertificationSettings = sqliteTable("course_certification_settings", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  requiredCompletionPercentage: integer("required_completion_percentage").notNull().default(100),
  eligibilityRule: text("eligibility_rule").notNull().default("all-required-items"),
  templateId: text("template_id"),
  templateVersion: text("template_version"),
  issuerName: text("issuer_name").notNull().default("AgentLab"),
  issuerTitle: text("issuer_title"),
  verificationEnabled: integer("verification_enabled", { mode: "boolean" }).notNull().default(true),
  pdfEnabled: integer("pdf_enabled", { mode: "boolean" }).notNull().default(false),
  pngEnabled: integer("png_enabled", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("uq_course_certification_settings_course").on(table.courseId),
  index("idx_course_certification_settings_enabled").on(table.enabled),
]);

/** Confirmed recipient name, kept separate so identity is never inferred from a client display name. */
export const certificateIdentities = sqliteTable("certificate_identities", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id").notNull(),
  displayName: text("display_name").notNull(),
  confirmedAt: text("confirmed_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.courseId] }),
  index("idx_certificate_identities_course").on(table.courseId),
]);

/** Immutable evidence snapshot plus lifecycle state for one user/course credential. */
export const certificateRecords = sqliteTable("certificate_records", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id").notNull(),
  status: text("status").notNull().default("ISSUED"),
  recipientDisplayName: text("recipient_display_name").notNull(),
  courseTitle: text("course_title").notNull(),
  credentialId: text("credential_id").notNull(),
  verificationCode: text("verification_code").notNull(),
  courseVersionSnapshot: text("course_version_snapshot").notNull(),
  progressSnapshot: text("progress_snapshot").notNull(),
  completedRequiredItemsSnapshot: integer("completed_required_items_snapshot").notNull(),
  totalRequiredItemsSnapshot: integer("total_required_items_snapshot").notNull(),
  eligibilityVerifiedAt: text("eligibility_verified_at").notNull(),
  eligibleAt: text("eligible_at"),
  issuedAt: text("issued_at"),
  templateId: text("template_id"),
  templateVersion: text("template_version"),
  pdfStoragePath: text("pdf_storage_path"),
  pngStoragePath: text("png_storage_path"),
  metadataSnapshot: text("metadata_snapshot").notNull().default("{}"),
  contentHash: text("content_hash"),
  revokedAt: text("revoked_at"),
  revocationReason: text("revocation_reason"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("uq_certificate_records_user_course").on(table.userId, table.courseId),
  uniqueIndex("uq_certificate_records_credential").on(table.credentialId),
  uniqueIndex("uq_certificate_records_verification_code").on(table.verificationCode),
  index("idx_certificate_records_status").on(table.status),
  index("idx_certificate_records_course").on(table.courseId),
]);
