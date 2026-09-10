ALTER TABLE `user_games` ADD `updated_at` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` integer DEFAULT (unixepoch()) NOT NULL;