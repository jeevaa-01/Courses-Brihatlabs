CREATE TABLE IF NOT EXISTS `course_certification_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`required_completion_percentage` integer DEFAULT 100 NOT NULL,
	`eligibility_rule` text DEFAULT 'all-required-items' NOT NULL,
	`template_id` text,
	`template_version` text,
	`issuer_name` text DEFAULT 'AgentLab' NOT NULL,
	`issuer_title` text,
	`verification_enabled` integer DEFAULT true NOT NULL,
	`pdf_enabled` integer DEFAULT false NOT NULL,
	`png_enabled` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `uq_course_certification_settings_course` ON `course_certification_settings` (`course_id`);
CREATE INDEX IF NOT EXISTS `idx_course_certification_settings_enabled` ON `course_certification_settings` (`enabled`);

CREATE TABLE IF NOT EXISTS `certificate_identities` (
	`user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
	`course_id` text NOT NULL,
	`display_name` text NOT NULL,
	`confirmed_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `course_id`)
);
CREATE INDEX IF NOT EXISTS `idx_certificate_identities_course` ON `certificate_identities` (`course_id`);

CREATE TABLE IF NOT EXISTS `certificate_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
	`course_id` text NOT NULL,
	`status` text DEFAULT 'ISSUED' NOT NULL,
	`recipient_display_name` text NOT NULL,
	`course_title` text NOT NULL,
	`credential_id` text NOT NULL,
	`verification_code` text NOT NULL,
	`course_version_snapshot` text NOT NULL,
	`progress_snapshot` text NOT NULL,
	`completed_required_items_snapshot` integer NOT NULL,
	`total_required_items_snapshot` integer NOT NULL,
	`eligibility_verified_at` text NOT NULL,
	`eligible_at` text,
	`issued_at` text,
	`template_id` text,
	`template_version` text,
	`pdf_storage_path` text,
	`png_storage_path` text,
	`metadata_snapshot` text DEFAULT '{}' NOT NULL,
	`content_hash` text,
	`revoked_at` text,
	`revocation_reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `uq_certificate_records_user_course` ON `certificate_records` (`user_id`, `course_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `uq_certificate_records_credential` ON `certificate_records` (`credential_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `uq_certificate_records_verification_code` ON `certificate_records` (`verification_code`);
CREATE INDEX IF NOT EXISTS `idx_certificate_records_status` ON `certificate_records` (`status`);
CREATE INDEX IF NOT EXISTS `idx_certificate_records_course` ON `certificate_records` (`course_id`);
