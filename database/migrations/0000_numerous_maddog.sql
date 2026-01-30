CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`user_id` text,
	`changes` text,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_entity` ON `audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_user` ON `audit_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_timestamp` ON `audit_log` (`timestamp`);--> statement-breakpoint
CREATE TABLE `catalogs` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`material` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalogs_code_unique` ON `catalogs` (`code`);--> statement-breakpoint
CREATE INDEX `idx_catalogs_code` ON `catalogs` (`code`);--> statement-breakpoint
CREATE INDEX `idx_catalogs_status` ON `catalogs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_catalogs_created_by` ON `catalogs` (`created_by`);--> statement-breakpoint
CREATE TABLE `rolls` (
	`id` text PRIMARY KEY NOT NULL,
	`barcode` text NOT NULL,
	`catalog_id` text NOT NULL,
	`color` text NOT NULL,
	`degree` text NOT NULL,
	`length_meters` real NOT NULL,
	`status` text DEFAULT 'in_stock' NOT NULL,
	`location` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`catalog_id`) REFERENCES `catalogs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_rolls_barcode` ON `rolls` (`barcode`);--> statement-breakpoint
CREATE INDEX `idx_rolls_catalog_id` ON `rolls` (`catalog_id`);--> statement-breakpoint
CREATE INDEX `idx_rolls_status` ON `rolls` (`status`);--> statement-breakpoint
CREATE INDEX `idx_rolls_barcode_status` ON `rolls` (`barcode`,`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role`);