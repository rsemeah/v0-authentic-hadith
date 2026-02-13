-- ============================================================
-- Learning Paths Addendum: events log, notes, compat columns
-- ============================================================

-- 1) Learning events log (analytics foundation)
create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'lesson_started', 'lesson_completed', 'path_started',
    'path_completed', 'path_resumed', 'note_saved'
  )),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_learning_events_user on public.learning_events(user_id);
create index if not exists idx_learning_events_type on public.learning_events(event_type);
create index if not exists idx_learning_events_created on public.learning_events(created_at);

alter table public.learning_events enable row level security;

drop policy if exists "le_select_own" on public.learning_events;
create policy "le_select_own" on public.learning_events
  for select using (auth.uid() = user_id);

drop policy if exists "le_insert_own" on public.learning_events;
create policy "le_insert_own" on public.learning_events
  for insert with check (auth.uid() = user_id);

-- 2) User lesson notes
create table if not exists public.user_lesson_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.learning_path_lessons(id) on delete cascade,
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  note_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index if not exists idx_uln_user on public.user_lesson_notes(user_id);
create index if not exists idx_uln_lesson on public.user_lesson_notes(lesson_id);

alter table public.user_lesson_notes enable row level security;

drop policy if exists "uln_select_own" on public.user_lesson_notes;
create policy "uln_select_own" on public.user_lesson_notes
  for select using (auth.uid() = user_id);

drop policy if exists "uln_insert_own" on public.user_lesson_notes;
create policy "uln_insert_own" on public.user_lesson_notes
  for insert with check (auth.uid() = user_id);

drop policy if exists "uln_update_own" on public.user_lesson_notes;
create policy "uln_update_own" on public.user_lesson_notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "uln_delete_own" on public.user_lesson_notes;
create policy "uln_delete_own" on public.user_lesson_notes
  for delete using (auth.uid() = user_id);

drop trigger if exists trg_set_updated_at_uln on public.user_lesson_notes;
create trigger trg_set_updated_at_uln
  before update on public.user_lesson_notes
  for each row execute function public.set_updated_at();

-- 3) Add estimated_minutes to lessons (populate from hadith_count)
-- ~2 min per hadith as a rough estimate
update public.learning_path_lessons
set estimated_minutes = greatest(5, hadith_count * 2)
where estimated_minutes is null;

-- 4) Add gamification-compatible columns to learning_paths for mobile compat
-- Mobile expects: name, difficulty, estimated_days, order_index
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'learning_paths' and column_name = 'name') then
    alter table public.learning_paths add column name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'learning_paths' and column_name = 'difficulty') then
    alter table public.learning_paths add column difficulty text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'learning_paths' and column_name = 'estimated_days') then
    alter table public.learning_paths add column estimated_days int;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'learning_paths' and column_name = 'order_index') then
    alter table public.learning_paths add column order_index int;
  end if;
end $$;

-- Sync compat columns from canonical columns
update public.learning_paths set
  name = title,
  difficulty = lower(coalesce(level, 'beginner')),
  estimated_days = case
    when slug = 'foundations' then 30
    when slug = 'daily-practice' then 21
    when slug = 'hadith-sciences' then 14
    when slug = 'comparative' then 21
    else 14
  end,
  order_index = sort_order
where name is null or order_index is null;

-- 5) Add learning path stat columns to user_stats for gamification
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'user_stats' and column_name = 'lessons_completed') then
    alter table public.user_stats add column lessons_completed int not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'user_stats' and column_name = 'paths_completed') then
    alter table public.user_stats add column paths_completed int not null default 0;
  end if;
end $$;
