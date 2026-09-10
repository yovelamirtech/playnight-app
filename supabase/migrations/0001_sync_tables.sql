-- PlayNight — §8 שלב 4: טבלאות Supabase לסנכרון אישי בין מכשירים.
--
-- הריצו את הקובץ הזה ב-Supabase SQL editor (Project → SQL Editor → New query)
-- אחרי יצירת פרויקט חדש. אין Supabase CLI מקושר בסביבת הפיתוח הזו — זו
-- מיגרציה ידנית, לא אוטומטית. ראו HANDOFF.md §8 להוראות מלאות.
--
-- scope מכוון: זה גיבוי/שחזור אישי של אותו משתמש בין מכשירים, לא הקטלוג
-- המשותף-רב-משתמשים ש-SPEC §6 מתאר לטווח ארוך (איפה typical_session_minutes
-- מצטבר מכל המשתמשים) — זה לא נבנה כאן.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  is_pro boolean not null default false,
  default_session_minutes integer not null default 60,
  primary_platforms jsonb not null default '[]'::jsonb,
  opted_out_of_calibration boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles for select
  using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles for insert
  with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update
  using (auth.uid() = id);

-- games: קטלוג משותף לקריאה, insert-once (בלי update policy בכוונה —
-- מונע דריסה של נתוני כיול משתמש אחר; ראה HANDOFF.md לפירוט המגבלה).
create table if not exists public.games (
  id text primary key,
  igdb_id integer,
  name text not null,
  cover_url text,
  release_year integer,
  genres jsonb not null default '[]'::jsonb,
  platforms jsonb not null default '[]'::jsonb,
  community_rating real,
  typical_session_minutes integer not null default 40,
  interruptible boolean not null default false,
  session_reports_count integer not null default 0,
  interruptible_reports_count integer not null default 0,
  is_calibrated boolean not null default false,
  hltb_main_story_minutes integer,
  hltb_main_extra_minutes integer,
  hltb_completionist_minutes integer,
  hltb_looked_up_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;

create policy "games: select all authenticated" on public.games for select
  using (auth.role() = 'authenticated');
create policy "games: insert authenticated" on public.games for insert
  with check (auth.role() = 'authenticated');

create table if not exists public.user_games (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  game_id text not null references public.games (id) on delete cascade,
  status text not null,
  platform text,
  added_at timestamptz not null,
  last_played_at timestamptz,
  hours_played real not null default 0,
  progress_percent integer,
  is_hidden boolean not null default false,
  dismissed_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_games enable row level security;

create policy "user_games: select own" on public.user_games for select
  using (auth.uid() = user_id);
create policy "user_games: insert own" on public.user_games for insert
  with check (auth.uid() = user_id);
create policy "user_games: update own" on public.user_games for update
  using (auth.uid() = user_id);
create policy "user_games: delete own" on public.user_games for delete
  using (auth.uid() = user_id);

create table if not exists public.sessions (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  game_id text not null references public.games (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer,
  mood_before text,
  rating text,
  stopped_note text,
  could_stop_anytime boolean,
  screenshot_url text
);

alter table public.sessions enable row level security;

create policy "sessions: select own" on public.sessions for select
  using (auth.uid() = user_id);
create policy "sessions: insert own" on public.sessions for insert
  with check (auth.uid() = user_id);
create policy "sessions: update own" on public.sessions for update
  using (auth.uid() = user_id);
create policy "sessions: delete own" on public.sessions for delete
  using (auth.uid() = user_id);

create table if not exists public.calibration_answers (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  game_id text not null references public.games (id) on delete cascade,
  session_id text references public.sessions (id) on delete set null,
  question_id integer not null,
  answer_value text not null,
  answered_at timestamptz not null
);

alter table public.calibration_answers enable row level security;

create policy "calibration_answers: select own" on public.calibration_answers for select
  using (auth.uid() = user_id);
create policy "calibration_answers: insert own" on public.calibration_answers for insert
  with check (auth.uid() = user_id);
create policy "calibration_answers: update own" on public.calibration_answers for update
  using (auth.uid() = user_id);
create policy "calibration_answers: delete own" on public.calibration_answers for delete
  using (auth.uid() = user_id);
