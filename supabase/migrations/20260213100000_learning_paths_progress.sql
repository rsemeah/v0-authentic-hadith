-- ============================================================
-- Learning Paths Progress Tracking
-- Tables: learning_paths, learning_path_lessons,
--         user_learning_path_progress, user_lesson_progress
-- ============================================================

-- 1) Learning paths (public content)
create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  subtitle text,
  icon text,
  color text,
  bg_color text,
  border_color text,
  level text,
  is_premium boolean not null default false,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 2) Lessons inside a path (public content)
create table if not exists public.learning_path_lessons (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  module_id text not null,
  module_title text not null,
  module_description text,
  slug text not null,
  title text not null,
  description text,
  order_index int not null,
  content_type text not null default 'hadith' check (content_type in ('hadith','article','quiz','reflection')),
  collection_slug text,
  book_number int,
  hadith_count int not null default 0,
  estimated_minutes int,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique(path_id, slug),
  unique(path_id, order_index)
);

create index if not exists idx_learning_path_lessons_path_order
  on public.learning_path_lessons(path_id, order_index);

-- 3) User ↔ Path progress (private per user)
create table if not exists public.user_learning_path_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','paused')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_lesson_id uuid references public.learning_path_lessons(id) on delete set null,
  last_activity_at timestamptz not null default now(),
  unique(user_id, path_id)
);

create index if not exists idx_ulpp_user on public.user_learning_path_progress(user_id);
create index if not exists idx_ulpp_path on public.user_learning_path_progress(path_id);

-- 4) User ↔ Lesson progress (private per user)
create table if not exists public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  lesson_id uuid not null references public.learning_path_lessons(id) on delete cascade,
  state text not null default 'not_started' check (state in ('not_started','in_progress','completed')),
  progress_percent int not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index if not exists idx_ulp_user_path on public.user_lesson_progress(user_id, path_id);
create index if not exists idx_ulp_lesson on public.user_lesson_progress(lesson_id);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_ulp on public.user_lesson_progress;
create trigger trg_set_updated_at_ulp
  before update on public.user_lesson_progress
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================

-- Public content: anyone can read
alter table public.learning_paths enable row level security;
alter table public.learning_path_lessons enable row level security;

drop policy if exists "learning_paths_public_read" on public.learning_paths;
create policy "learning_paths_public_read" on public.learning_paths
  for select using (true);

drop policy if exists "learning_path_lessons_public_read" on public.learning_path_lessons;
create policy "learning_path_lessons_public_read" on public.learning_path_lessons
  for select using (true);

-- User progress: own data only
alter table public.user_learning_path_progress enable row level security;
alter table public.user_lesson_progress enable row level security;

drop policy if exists "ulpp_select_own" on public.user_learning_path_progress;
create policy "ulpp_select_own" on public.user_learning_path_progress
  for select using (auth.uid() = user_id);

drop policy if exists "ulpp_insert_own" on public.user_learning_path_progress;
create policy "ulpp_insert_own" on public.user_learning_path_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "ulpp_update_own" on public.user_learning_path_progress;
create policy "ulpp_update_own" on public.user_learning_path_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ulp_select_own" on public.user_lesson_progress;
create policy "ulp_select_own" on public.user_lesson_progress
  for select using (auth.uid() = user_id);

drop policy if exists "ulp_insert_own" on public.user_lesson_progress;
create policy "ulp_insert_own" on public.user_lesson_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "ulp_update_own" on public.user_lesson_progress;
create policy "ulp_update_own" on public.user_lesson_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Seed: Insert the 4 learning paths + all lessons
-- ============================================================

-- Foundations of Hadith
insert into public.learning_paths (slug, title, subtitle, description, icon, color, bg_color, border_color, level, is_premium, sort_order)
values (
  'foundations',
  'Foundations of Hadith',
  'Start Here',
  'Begin your journey with the most essential and widely-known hadiths. These foundational narrations cover the pillars of Islam, daily worship, and core beliefs.',
  'BookOpen',
  'text-[#1B5E43]',
  'bg-[#1B5E43]/10',
  'border-[#1B5E43]/30',
  'Beginner',
  false,
  1
);

-- Daily Practice
insert into public.learning_paths (slug, title, subtitle, description, icon, color, bg_color, border_color, level, is_premium, sort_order)
values (
  'daily-practice',
  'Daily Practice',
  'Practical Guidance',
  'Hadiths that guide your everyday life, from morning supplications to eating etiquette, sleeping habits, and interactions with others.',
  'Star',
  'text-[#C5A059]',
  'bg-[#C5A059]/10',
  'border-[#C5A059]/30',
  'Beginner-Intermediate',
  false,
  2
);

-- Hadith Sciences
insert into public.learning_paths (slug, title, subtitle, description, icon, color, bg_color, border_color, level, is_premium, sort_order)
values (
  'hadith-sciences',
  'Hadith Sciences',
  'Mustalah al-Hadith',
  'Understand the methodology behind hadith authentication: chains of narration (isnad), narrator reliability, and hadith classification.',
  'GraduationCap',
  'text-[#3b82f6]',
  'bg-blue-50',
  'border-blue-200',
  'Intermediate',
  true,
  3
);

-- Comparative Study
insert into public.learning_paths (slug, title, subtitle, description, icon, color, bg_color, border_color, level, is_premium, sort_order)
values (
  'comparative',
  'Comparative Study',
  'Cross-Collection Analysis',
  'Study the same topics across multiple collections to see how different scholars compiled and organized the prophetic traditions.',
  'Trophy',
  'text-[#7c3aed]',
  'bg-purple-50',
  'border-purple-200',
  'Advanced',
  true,
  4
);

-- Seed lessons for Foundations
with fp as (select id from public.learning_paths where slug = 'foundations')
insert into public.learning_path_lessons (path_id, module_id, module_title, module_description, slug, title, order_index, collection_slug, book_number, hadith_count)
values
  ((select id from fp), 'pillars', 'The Pillars of Islam', 'Hadiths about the five pillars: Shahada, Salah, Zakat, Fasting, and Hajj', 'faith', 'Book of Revelation', 1, 'sahih-bukhari', 1, 7),
  ((select id from fp), 'pillars', 'The Pillars of Islam', 'Hadiths about the five pillars: Shahada, Salah, Zakat, Fasting, and Hajj', 'belief', 'Book of Belief', 2, 'sahih-bukhari', 2, 51),
  ((select id from fp), 'pillars', 'The Pillars of Islam', 'Hadiths about the five pillars: Shahada, Salah, Zakat, Fasting, and Hajj', 'knowledge', 'Book of Knowledge', 3, 'sahih-bukhari', 3, 76),
  ((select id from fp), 'purification', 'Purification & Prayer', 'Learn the prophetic guidance on cleanliness and establishing prayer', 'wudu', 'The Book on Purification', 4, 'jami-tirmidhi', 1, 148),
  ((select id from fp), 'purification', 'Purification & Prayer', 'Learn the prophetic guidance on cleanliness and establishing prayer', 'salah', 'The Book on Salat', 5, 'jami-tirmidhi', 2, 423),
  ((select id from fp), 'purification', 'Purification & Prayer', 'Learn the prophetic guidance on cleanliness and establishing prayer', 'friday', 'The Book on Friday Prayer', 6, 'jami-tirmidhi', 4, 83),
  ((select id from fp), 'character', 'Prophetic Character', 'Explore the Prophet''s exemplary conduct and manners', 'manners', 'Book of Good Manners', 7, 'sahih-bukhari', 78, 56),
  ((select id from fp), 'character', 'Prophetic Character', 'Explore the Prophet''s exemplary conduct and manners', 'kindness', 'Book of Companions', 8, 'sahih-bukhari', 62, 34);

-- Seed lessons for Daily Practice
with dp as (select id from public.learning_paths where slug = 'daily-practice')
insert into public.learning_path_lessons (path_id, module_id, module_title, module_description, slug, title, order_index, collection_slug, book_number, hadith_count)
values
  ((select id from dp), 'food-drink', 'Food, Drink & Hospitality', 'Prophetic etiquettes of eating, drinking, and hosting guests', 'food', 'Book of Foods', 1, 'sahih-bukhari', 70, 70),
  ((select id from dp), 'food-drink', 'Food, Drink & Hospitality', 'Prophetic etiquettes of eating, drinking, and hosting guests', 'drinks', 'Book of Drinks', 2, 'sahih-bukhari', 74, 45),
  ((select id from dp), 'food-drink', 'Food, Drink & Hospitality', 'Prophetic etiquettes of eating, drinking, and hosting guests', 'meals-t', 'Chapters on Food', 3, 'jami-tirmidhi', 26, 60),
  ((select id from dp), 'duas', 'Supplications & Remembrance', 'Daily duas and adhkar from the Sunnah', 'duas-t', 'Chapters on Supplications', 4, 'jami-tirmidhi', 49, 131),
  ((select id from dp), 'duas', 'Supplications & Remembrance', 'Daily duas and adhkar from the Sunnah', 'invocations', 'Book of Invocations', 5, 'sahih-bukhari', 80, 68),
  ((select id from dp), 'dealings', 'Business & Social Ethics', 'Islamic principles of trade, transactions, and social conduct', 'sales', 'Book of Sales', 6, 'sahih-bukhari', 34, 195),
  ((select id from dp), 'dealings', 'Business & Social Ethics', 'Islamic principles of trade, transactions, and social conduct', 'business-t', 'Chapters on Business', 7, 'jami-tirmidhi', 12, 75);

-- Seed lessons for Hadith Sciences
with hs as (select id from public.learning_paths where slug = 'hadith-sciences')
insert into public.learning_path_lessons (path_id, module_id, module_title, module_description, slug, title, order_index, collection_slug, book_number, hadith_count)
values
  ((select id from hs), 'classification', 'Hadith Classification', 'Understanding Sahih, Hasan, Da''if, and Mawdu'' categories', 'sahih-intro', 'What Makes a Hadith Sahih?', 1, 'sahih-bukhari', null, 20),
  ((select id from hs), 'classification', 'Hadith Classification', 'Understanding Sahih, Hasan, Da''if, and Mawdu'' categories', 'hasan-intro', 'The Hasan Category', 2, 'jami-tirmidhi', null, 20),
  ((select id from hs), 'classification', 'Hadith Classification', 'Understanding Sahih, Hasan, Da''if, and Mawdu'' categories', 'grades', 'Understanding Grading', 3, 'sunan-abu-dawud', null, 15),
  ((select id from hs), 'narrators', 'Science of Narrators', 'Study of narrator chains and their reliability assessment', 'isnad', 'Chain of Narration Basics', 4, 'sahih-muslim', null, 25),
  ((select id from hs), 'narrators', 'Science of Narrators', 'Study of narrator chains and their reliability assessment', 'rijal', 'Narrator Biographies', 5, 'sahih-bukhari', null, 20);

-- Seed lessons for Comparative Study
with cs as (select id from public.learning_paths where slug = 'comparative')
insert into public.learning_path_lessons (path_id, module_id, module_title, module_description, slug, title, order_index, collection_slug, book_number, hadith_count)
values
  ((select id from cs), 'six-books', 'The Six Major Collections', 'Compare how the Kutub al-Sittah approach the same hadith material', 'bukhari-study', 'Sahih al-Bukhari Overview', 1, 'sahih-bukhari', null, 50),
  ((select id from cs), 'six-books', 'The Six Major Collections', 'Compare how the Kutub al-Sittah approach the same hadith material', 'muslim-study', 'Sahih Muslim Overview', 2, 'sahih-muslim', null, 50),
  ((select id from cs), 'six-books', 'The Six Major Collections', 'Compare how the Kutub al-Sittah approach the same hadith material', 'tirmidhi-study', 'Jami at-Tirmidhi Overview', 3, 'jami-tirmidhi', null, 50),
  ((select id from cs), 'six-books', 'The Six Major Collections', 'Compare how the Kutub al-Sittah approach the same hadith material', 'abu-dawud-study', 'Sunan Abu Dawud Overview', 4, 'sunan-abu-dawud', null, 50),
  ((select id from cs), 'six-books', 'The Six Major Collections', 'Compare how the Kutub al-Sittah approach the same hadith material', 'nasai-study', 'Sunan an-Nasai Overview', 5, 'sunan-nasai', null, 50),
  ((select id from cs), 'six-books', 'The Six Major Collections', 'Compare how the Kutub al-Sittah approach the same hadith material', 'ibn-majah-study', 'Sunan Ibn Majah Overview', 6, 'sunan-ibn-majah', null, 50);
