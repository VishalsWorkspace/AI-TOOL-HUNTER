-- AI Tool Hunter — V2 Upgrade (Compare, Reviews, Stacks, Recommendations, Submissions)
-- Run this whole file once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Requires 001_upgrade.sql to have already been run.

-- ============================================================================
-- 0. FIX: public.tools.slug does not exist yet. Every tool card link and the
-- whole /tool/[slug] page have been unreachable because of this. Backfill is
-- title-derived with the numeric id appended, which guarantees uniqueness
-- trivially (id is already the primary key) without needing collision checks.
-- ============================================================================
alter table public.tools add column if not exists slug text;

update public.tools
set slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')) || '-' || id
where slug is null;

alter table public.tools alter column slug set not null;

drop index if exists tools_slug_unique_idx;
create unique index tools_slug_unique_idx on public.tools (slug);

-- ============================================================================
-- 1. tool_reviews — star rating + written review, one per user per tool.
-- ============================================================================
create table if not exists public.tool_reviews (
  id bigint generated always as identity primary key,
  tool_id bigint not null references public.tools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review text,
  user_name text,
  user_avatar text,
  created_at timestamptz not null default now(),
  unique (tool_id, user_id)
);

create index if not exists tool_reviews_tool_id_idx on public.tool_reviews (tool_id);

alter table public.tool_reviews enable row level security;

drop policy if exists "tool_reviews_public_read" on public.tool_reviews;
create policy "tool_reviews_public_read"
  on public.tool_reviews for select
  using (true);

drop policy if exists "tool_reviews_insert_own" on public.tool_reviews;
create policy "tool_reviews_insert_own"
  on public.tool_reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "tool_reviews_update_own" on public.tool_reviews;
create policy "tool_reviews_update_own"
  on public.tool_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tool_reviews_delete_own" on public.tool_reviews;
create policy "tool_reviews_delete_own"
  on public.tool_reviews for delete
  using (auth.uid() = user_id);

-- Aggregate view — resolves permissions as the view owner (same trick as
-- saved_tools_counts in 001), so average ratings are public even though the
-- underlying table's writes are locked to each user's own row.
create or replace view public.tool_review_stats as
select tool_id, round(avg(rating)::numeric, 1) as avg_rating, count(*)::int as review_count
from public.tool_reviews
group by tool_id;

grant select on public.tool_review_stats to anon, authenticated;

-- ============================================================================
-- 2. user_stacks — named, shareable collections of tools.
-- Deviates from the literal spec in two ways, both necessary:
--   - tool_ids is bigint[] (tools.id is bigint; text[] would just mean
--     casting on every read/write for no benefit).
--   - user_name/user_avatar are added (denormalized from auth metadata at
--     creation time) because "public stack page shows creator name+avatar"
--     isn't otherwise achievable — anon/authenticated roles can't read
--     auth.users directly.
-- ============================================================================
create table if not exists public.user_stacks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  tool_ids bigint[] not null default '{}',
  is_public boolean not null default true,
  slug text not null unique,
  user_name text,
  user_avatar text,
  created_at timestamptz not null default now()
);

create index if not exists user_stacks_user_id_idx on public.user_stacks (user_id);

alter table public.user_stacks enable row level security;

drop policy if exists "user_stacks_read" on public.user_stacks;
create policy "user_stacks_read"
  on public.user_stacks for select
  using (is_public = true or auth.uid() = user_id);

drop policy if exists "user_stacks_insert_own" on public.user_stacks;
create policy "user_stacks_insert_own"
  on public.user_stacks for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_stacks_update_own" on public.user_stacks;
create policy "user_stacks_update_own"
  on public.user_stacks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_stacks_delete_own" on public.user_stacks;
create policy "user_stacks_delete_own"
  on public.user_stacks for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 3. tool_submissions — user-submitted tools awaiting manual review.
-- No admin panel yet, so no public/shared read policy — just capture.
-- ============================================================================
create table if not exists public.tool_submissions (
  id bigint generated always as identity primary key,
  submitter_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  url text not null,
  category text,
  pricing text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.tool_submissions enable row level security;

drop policy if exists "tool_submissions_insert_own" on public.tool_submissions;
create policy "tool_submissions_insert_own"
  on public.tool_submissions for insert
  with check (auth.uid() = submitter_user_id);

drop policy if exists "tool_submissions_read_own" on public.tool_submissions;
create policy "tool_submissions_read_own"
  on public.tool_submissions for select
  using (auth.uid() = submitter_user_id);
