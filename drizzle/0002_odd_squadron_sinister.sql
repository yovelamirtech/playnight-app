PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`created_at` integer NOT NULL,
	`is_pro` integer DEFAULT false NOT NULL,
	`default_session_minutes` integer DEFAULT 60 NOT NULL,
	`primary_platforms` text DEFAULT '[]' NOT NULL,
	`opted_out_of_calibration` integer DEFAULT false NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "created_at", "is_pro", "default_session_minutes", "primary_platforms", "opted_out_of_calibration", "updated_at") SELECT "id", "email", "created_at", "is_pro", "default_session_minutes", "primary_platforms", "opted_out_of_calibration", unixepoch() FROM `users`;
--> statement-breakpoint
DROP TABLE `users`;
--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;
--> statement-breakpoint
CREATE TABLE `__new_user_games` (
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
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_games`("id","user_id","game_id","status","platform","added_at","last_played_at","hours_played","progress_percent","is_hidden","dismissed_until","updated_at") SELECT "id","user_id","game_id","status","platform","added_at","last_played_at","hours_played","progress_percent","is_hidden","dismissed_until", unixepoch() FROM `user_games`;
--> statement-breakpoint
DROP TABLE `user_games`;
--> statement-breakpoint
ALTER TABLE `__new_user_games` RENAME TO `user_games`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
