-- ============================================================================
-- Deadline Radar — schema, RLS, and admin plumbing
-- ============================================================================
-- Run this in a fresh Supabase project (SQL editor, or `supabase db push`),
-- then run 0002_seed_deadlines.sql to populate the venue list.
--
-- Access model
-- ------------
--   deadlines        PUBLIC READ (anyone, even signed-out). Writes are locked
--                    to the service role (bypasses RLS) or an admin user. This
--                    is the central, updatable product dataset.
--   saved_deadlines  PER-USER. Each row is owned by a user; RLS enforces
--                    auth.uid() = user_id for every operation.
--   reminder_prefs   PER-USER, same ownership rule.
--   admins           Membership table: a user_id here may write to `deadlines`.
-- ============================================================================

-- Helpful for updated_at bookkeeping.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- admins: who is allowed to write to the central `deadlines` table.
-- Add yourself with:  insert into public.admins (user_id) values ('<your-uid>');
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Admins can see the admins list; nobody else can.
drop policy if exists "admins are visible to admins" on public.admins;
create policy "admins are visible to admins"
  on public.admins for select
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- is_admin(): true when the current user is in the admins table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- deadlines: the central venue dataset. Mirrors the `Deadline` TS interface.
-- ISO date fields are stored as text to preserve the app's exact strings
-- (both date-only "2026-09-24" and datetime "2026-09-24T23:59:00Z" forms).
-- ---------------------------------------------------------------------------
create table if not exists public.deadlines (
  id                text primary key,
  name              text not null,
  full_name         text not null,
  categories        text[] not null default '{}',
  abstract_deadline text,
  paper_deadline    text,
  notification_date text,
  event_start       text,
  event_end         text,
  location          text,
  website           text not null,
  timezone          text,
  confidence        text not null default 'approximate'
                      check (confidence in ('confirmed', 'approximate', 'tbd')),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists deadlines_set_updated_at on public.deadlines;
create trigger deadlines_set_updated_at
  before update on public.deadlines
  for each row execute function public.set_updated_at();

alter table public.deadlines enable row level security;

-- PUBLIC READ: anyone (including anonymous) may select deadlines.
drop policy if exists "deadlines are publicly readable" on public.deadlines;
create policy "deadlines are publicly readable"
  on public.deadlines for select
  using (true);

-- Writes restricted to admins. (The service role bypasses RLS entirely, so
-- server-side / SQL-editor maintenance always works regardless of these.)
drop policy if exists "admins can insert deadlines" on public.deadlines;
create policy "admins can insert deadlines"
  on public.deadlines for insert
  with check (public.is_admin());

drop policy if exists "admins can update deadlines" on public.deadlines;
create policy "admins can update deadlines"
  on public.deadlines for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can delete deadlines" on public.deadlines;
create policy "admins can delete deadlines"
  on public.deadlines for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- saved_deadlines: per-user starred / tracked venues.
-- ---------------------------------------------------------------------------
create table if not exists public.saved_deadlines (
  user_id     uuid not null references auth.users (id) on delete cascade,
  deadline_id text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, deadline_id)
);

alter table public.saved_deadlines enable row level security;

drop policy if exists "users read their saved deadlines" on public.saved_deadlines;
create policy "users read their saved deadlines"
  on public.saved_deadlines for select
  using (auth.uid() = user_id);

drop policy if exists "users insert their saved deadlines" on public.saved_deadlines;
create policy "users insert their saved deadlines"
  on public.saved_deadlines for insert
  with check (auth.uid() = user_id);

drop policy if exists "users delete their saved deadlines" on public.saved_deadlines;
create policy "users delete their saved deadlines"
  on public.saved_deadlines for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reminder_prefs: per-user reminder settings.
-- ---------------------------------------------------------------------------
create table if not exists public.reminder_prefs (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  reminder_days   integer not null default 7 check (reminder_days between 0 and 365),
  email_reminders boolean not null default false,
  updated_at      timestamptz not null default now()
);

alter table public.reminder_prefs enable row level security;

drop policy if exists "users read their reminder prefs" on public.reminder_prefs;
create policy "users read their reminder prefs"
  on public.reminder_prefs for select
  using (auth.uid() = user_id);

drop policy if exists "users upsert their reminder prefs (insert)" on public.reminder_prefs;
create policy "users upsert their reminder prefs (insert)"
  on public.reminder_prefs for insert
  with check (auth.uid() = user_id);

drop policy if exists "users upsert their reminder prefs (update)" on public.reminder_prefs;
create policy "users upsert their reminder prefs (update)"
  on public.reminder_prefs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
