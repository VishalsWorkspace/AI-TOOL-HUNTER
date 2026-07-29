-- AI Tool Hunter — Discovery Platform Upgrade
-- Run this whole file once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- NOTE: this assumes public.tools.id is `bigint` (Supabase's default identity PK type).
-- If your tools.id column is a different type (e.g. uuid or int4), adjust the
-- `tool_id bigint` column below to match before running.

-- 0. FIX: public.tools currently has RLS enabled with no read policy, so anon/authenticated
-- callers get an empty result set. This is what was making the homepage/detail page appear
-- to return zero tools even though the table has real rows — needed for literally every
-- feature below (and the app in general) to work.
alter table public.tools enable row level security;

drop policy if exists "tools_public_read" on public.tools;
create policy "tools_public_read"
  on public.tools for select
  using (true);

-- 1. saved_tools: lets a logged-in user bookmark a tool.
create table if not exists public.saved_tools (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id bigint not null references public.tools(id) on delete cascade,
  saved_at timestamptz not null default now(),
  unique (user_id, tool_id)
);

create index if not exists saved_tools_user_id_idx on public.saved_tools (user_id);
create index if not exists saved_tools_tool_id_idx on public.saved_tools (tool_id);

alter table public.saved_tools enable row level security;

drop policy if exists "saved_tools_select_own" on public.saved_tools;
create policy "saved_tools_select_own"
  on public.saved_tools for select
  using (auth.uid() = user_id);

drop policy if exists "saved_tools_insert_own" on public.saved_tools;
create policy "saved_tools_insert_own"
  on public.saved_tools for insert
  with check (auth.uid() = user_id);

drop policy if exists "saved_tools_delete_own" on public.saved_tools;
create policy "saved_tools_delete_own"
  on public.saved_tools for delete
  using (auth.uid() = user_id);

-- 2. tools.featured: powers the homepage "Trending This Week" row.
alter table public.tools add column if not exists featured boolean not null default false;

-- 3. saved_tools_counts: aggregate save counts per tool, for the "Most Saved" sort.
-- A plain view resolves permissions/RLS as the view's OWNER (not the querying user),
-- so this can expose an aggregate count to any signed-in/anon caller without exposing
-- who saved what — the underlying saved_tools RLS policies above still fully apply to
-- direct table access.
create or replace view public.saved_tools_counts as
select tool_id, count(*)::int as save_count
from public.saved_tools
group by tool_id;

grant select on public.saved_tools_counts to anon, authenticated;
