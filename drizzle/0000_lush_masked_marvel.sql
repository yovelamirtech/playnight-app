CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`igdb_id` integer,
	`name` text NOT NULL,
	`cover_url` text,
	`release_year` integer,
	`genres` text DEFAULT '[]' NOT NULL,
	`platforms` text DEFAULT '[]' NOT NULL,
	`community_rating` real,
	`typical_session_minutes` integer DEFAULT 40 NOT NULL,
	`interruptible` integer DEFAULT false NOT NULL,
	`session_reports_count` integer DEFAULT 0 NOT NULL,
	`interruptible_reports_count` integer DEFAULT 0 NOT NULL,
	`is_calibrated` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `calibration_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`game_id` text NOT NULL,
	`session_id` text,
	`question_id` integer NOT NULL,
	`answer_value` text NOT NULL,
	`answered_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recommendations_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`game_id` text NOT NULL,
	`shown_at` integer NOT NULL,
	`score` real NOT NULL,
	`action` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`game_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`duration_minutes` integer,
	`mood_before` text,
	`rating` text,
	`stopped_note` text,
	`could_stop_anytime` integer,
	`screenshot_url` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `friends` (
	`user_id` text NOT NULL,
	`friend_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `game_nights` (
	`id` text PRIMARY KEY NOT NULL,
	`host_id` text NOT NULL,
	`scheduled_at` integer NOT NULL,
	`participants` text DEFAULT '[]' NOT NULL,
	`chosen_game_id` text,
	FOREIGN KEY (`host_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`chosen_game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_games` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`game_id` text NOT NULL,
	`status` text DEFAULT 'backlog' NOT NULL,
	`platform` text,
	`added_at` integer NOT NULL,
	`last_played_at` integer,
	`hours_played` real DEFAULT 0 NOT NULL,
	`progress_percent` integer,
	`is_hidden` integer DEFAULT false NOT NULL,
	`dismissed_until` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`created_at` integer NOT NULL,
	`is_pro` integer DEFAULT false NOT NULL,
	`default_session_minutes` integer DEFAULT 60 NOT NULL,
	`primary_platforms` text DEFAULT '[]' NOT NULL,
	`opted_out_of_calibration` integer DEFAULT false NOT NULL
);
