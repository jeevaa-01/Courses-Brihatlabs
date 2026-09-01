CREATE TABLE `ai_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`program_id` text,
	`subject_id` text,
	`lesson_id` text,
	`context` text DEFAULT '{}' NOT NULL,
	`messages` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_message_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`program_id`) REFERENCES `career_programs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`lesson_id`) REFERENCES `subject_lessons`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_ai_conversations_user` ON `ai_conversations` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_ai_conversations_lesson` ON `ai_conversations` (`lesson_id`);--> statement-breakpoint
CREATE TABLE `career_domains` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `career_domains_slug_unique` ON `career_domains` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_career_domains_slug` ON `career_domains` (`slug`);--> statement-breakpoint
CREATE TABLE `career_programs` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`domain_id` text NOT NULL,
	`name` text NOT NULL,
	`subtitle` text NOT NULL,
	`description` text NOT NULL,
	`short_description` text NOT NULL,
	`level` text DEFAULT 'beginner' NOT NULL,
	`duration` text NOT NULL,
	`estimated_hours` integer DEFAULT 0 NOT NULL,
	`job_roles` text DEFAULT '[]' NOT NULL,
	`outcomes` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`image_url` text,
	`created_by` text NOT NULL,
	`updated_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`domain_id`) REFERENCES `career_domains`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `career_programs_slug_unique` ON `career_programs` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_career_programs_slug` ON `career_programs` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_career_programs_domain` ON `career_programs` (`domain_id`);--> statement-breakpoint
CREATE INDEX `idx_career_programs_status` ON `career_programs` (`status`);--> statement-breakpoint
CREATE TABLE `coupon_redemptions` (
	`id` text PRIMARY KEY NOT NULL,
	`coupon_id` text NOT NULL,
	`user_id` text NOT NULL,
	`order_id` text NOT NULL,
	`discount_amount` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupon_redemptions_order_id_unique` ON `coupon_redemptions` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_coupon_redemptions_coupon_user` ON `coupon_redemptions` (`coupon_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`type` text DEFAULT 'percentage' NOT NULL,
	`value` integer NOT NULL,
	`max_uses` integer,
	`used_count` integer DEFAULT 0 NOT NULL,
	`max_uses_per_user` integer,
	`min_order_amount` integer,
	`applicable_programs` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`starts_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE INDEX `idx_coupons_active` ON `coupons` (`active`);--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`program_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`enrolled_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text,
	`access_until` text,
	`progress_percentage` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`program_id`) REFERENCES `career_programs`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_enrollments_user_program` ON `enrollments` (`user_id`,`program_id`);--> statement-breakpoint
CREATE INDEX `idx_enrollments_status` ON `enrollments` (`status`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`program_id` text NOT NULL,
	`base_price` integer NOT NULL,
	`discount_amount` integer DEFAULT 0 NOT NULL,
	`coupon_id` text,
	`tax_amount` integer DEFAULT 0 NOT NULL,
	`final_price` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text,
	`provider_order_id` text,
	`idempotency_key` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`program_id`) REFERENCES `career_programs`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_provider_order_id_unique` ON `orders` (`provider_order_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_key_unique` ON `orders` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_orders_user` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_program` ON `orders` (`program_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_status` ON `orders` (`status`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`provider` text NOT NULL,
	`transaction_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`status` text DEFAULT 'initiated' NOT NULL,
	`payment_details` text DEFAULT '{}' NOT NULL,
	`error_message` text,
	`webhook_verified` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_transaction_id_unique` ON `payments` (`transaction_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_payments_transaction` ON `payments` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_order` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_status` ON `payments` (`status`);--> statement-breakpoint
CREATE TABLE `program_certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`certificate_id` text NOT NULL,
	`user_id` text NOT NULL,
	`program_id` text NOT NULL,
	`learner_name` text NOT NULL,
	`program_name` text NOT NULL,
	`completed_skills` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`verification_url` text,
	`issued_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`revoked_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`program_id`) REFERENCES `career_programs`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `program_certificates_certificate_id_unique` ON `program_certificates` (`certificate_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_program_certificates_user_program` ON `program_certificates` (`user_id`,`program_id`);--> statement-breakpoint
CREATE INDEX `idx_program_certificates_status` ON `program_certificates` (`status`);--> statement-breakpoint
CREATE TABLE `program_pricing` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`base_price` integer NOT NULL,
	`sale_price` integer,
	`currency` text DEFAULT 'INR' NOT NULL,
	`discount_percentage` integer,
	`sale_start_date` text,
	`sale_end_date` text,
	`access_duration_days` integer,
	`pricing_type` text DEFAULT 'career_pack' NOT NULL,
	`installment_allowed` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`program_id`) REFERENCES `career_programs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `program_pricing_program_id_unique` ON `program_pricing` (`program_id`);--> statement-breakpoint
CREATE INDEX `idx_program_pricing_program` ON `program_pricing` (`program_id`);--> statement-breakpoint
CREATE TABLE `program_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`started_at` text,
	`completed_at` text,
	`score` integer,
	`time_spent_seconds` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`lesson_id`) REFERENCES `subject_lessons`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_program_progress_enrollment` ON `program_progress` (`enrollment_id`);--> statement-breakpoint
CREATE INDEX `idx_program_progress_subject` ON `program_progress` (`subject_id`);--> statement-breakpoint
CREATE INDEX `idx_program_progress_status` ON `program_progress` (`status`);--> statement-breakpoint
CREATE TABLE `program_subjects` (
	`program_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`required` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`program_id`, `subject_id`),
	FOREIGN KEY (`program_id`) REFERENCES `career_programs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_program_subjects_program` ON `program_subjects` (`program_id`);--> statement-breakpoint
CREATE INDEX `idx_program_subjects_subject` ON `program_subjects` (`subject_id`);--> statement-breakpoint
CREATE TABLE `project_catalog` (
	`slug` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subject_assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_id` text NOT NULL,
	`module_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`type` text DEFAULT 'quiz' NOT NULL,
	`passing_score` integer DEFAULT 70 NOT NULL,
	`time_limit` integer,
	`questions_json` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`module_id`) REFERENCES `subject_modules`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_subject_assessments_subject` ON `subject_assessments` (`subject_id`);--> statement-breakpoint
CREATE INDEX `idx_subject_assessments_module` ON `subject_assessments` (`module_id`);--> statement-breakpoint
CREATE TABLE `subject_lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`module_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`type` text DEFAULT 'video' NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`estimated_minutes` integer DEFAULT 0 NOT NULL,
	`content` text DEFAULT '[]' NOT NULL,
	`previewable` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `subject_modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_subject_lessons_module` ON `subject_lessons` (`module_id`);--> statement-breakpoint
CREATE INDEX `idx_subject_lessons_slug` ON `subject_lessons` (`module_id`,`slug`);--> statement-breakpoint
CREATE TABLE `subject_modules` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`estimated_minutes` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_subject_modules_subject` ON `subject_modules` (`subject_id`);--> statement-breakpoint
CREATE INDEX `idx_subject_modules_slug` ON `subject_modules` (`subject_id`,`slug`);--> statement-breakpoint
CREATE TABLE `subject_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`difficulty` text DEFAULT 'intermediate' NOT NULL,
	`type` text DEFAULT 'intermediate' NOT NULL,
	`estimated_minutes` integer DEFAULT 0 NOT NULL,
	`requirements_json` text DEFAULT '[]' NOT NULL,
	`deliverables` text DEFAULT '[]' NOT NULL,
	`rubric` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_subject_projects_subject` ON `subject_projects` (`subject_id`);--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text,
	`difficulty` text DEFAULT 'beginner' NOT NULL,
	`estimated_hours` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_slug_unique` ON `subjects` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_subjects_slug` ON `subjects` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_subjects_status` ON `subjects` (`status`);--> statement-breakpoint
CREATE TABLE `user_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`proficiency_level` text DEFAULT 'beginner' NOT NULL,
	`progress_percentage` integer DEFAULT 0 NOT NULL,
	`lessons_completed` integer DEFAULT 0 NOT NULL,
	`lessons_total` integer DEFAULT 0 NOT NULL,
	`projects_completed` integer DEFAULT 0 NOT NULL,
	`assessments_passed` integer DEFAULT 0 NOT NULL,
	`last_activity_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_skills_user_subject` ON `user_skills` (`user_id`,`subject_id`);--> statement-breakpoint
CREATE INDEX `idx_user_skills_proficiency` ON `user_skills` (`proficiency_level`);