-- Account deletion: archive user data then purge
-- Covers ALL user-owned tables including learning progress

create table if not exists public.archived_user_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  archived_at timestamptz default now(),
  data jsonb not null
);

-- Enable RLS on archive table (only service_role should access)
alter table public.archived_user_data enable row level security;

create or replace function public.delete_user_account(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_data jsonb := '{}'::jsonb;
  v_exists boolean;
begin
  -- ── Archive phase: snapshot every user-owned table ──

  -- profiles (PK is id, not user_id)
  select to_regclass('public.profiles') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('profiles',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.profiles where id = p_user_id) t));
  end if;

  -- saved_collections
  select to_regclass('public.saved_collections') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('saved_collections',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.saved_collections where user_id = p_user_id) t));
  end if;

  -- saved_hadith (singular variant)
  select to_regclass('public.saved_hadith') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('saved_hadith',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.saved_hadith where user_id = p_user_id) t));
  end if;

  -- saved_hadiths (plural variant)
  select to_regclass('public.saved_hadiths') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('saved_hadiths',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.saved_hadiths where user_id = p_user_id) t));
  end if;

  -- subscriptions
  select to_regclass('public.subscriptions') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('subscriptions',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.subscriptions where user_id = p_user_id) t));
  end if;

  -- user_usage (subscription quotas)
  select to_regclass('public.user_usage') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('user_usage',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_usage where user_id = p_user_id) t));
  end if;

  -- sahaba_reading_progress
  select to_regclass('public.sahaba_reading_progress') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('sahaba_reading_progress',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.sahaba_reading_progress where user_id = p_user_id) t));
  end if;

  -- user_streaks
  select to_regclass('public.user_streaks') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('user_streaks',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_streaks where user_id = p_user_id) t));
  end if;

  -- user_folders
  select to_regclass('public.user_folders') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('user_folders',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_folders where user_id = p_user_id) t));
  end if;

  -- user_settings
  select to_regclass('public.user_settings') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('user_settings',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_settings where user_id = p_user_id) t));
  end if;

  -- user_ai_queries
  select to_regclass('public.user_ai_queries') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('user_ai_queries',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_ai_queries where user_id = p_user_id) t));
  end if;

  -- user_learning_path_progress
  select to_regclass('public.user_learning_path_progress') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('user_learning_path_progress',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_learning_path_progress where user_id = p_user_id) t));
  end if;

  -- user_lesson_progress
  select to_regclass('public.user_lesson_progress') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('user_lesson_progress',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_lesson_progress where user_id = p_user_id) t));
  end if;

  -- learning_events
  select to_regclass('public.learning_events') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('learning_events',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.learning_events where user_id = p_user_id) t));
  end if;

  -- user_lesson_notes
  select to_regclass('public.user_lesson_notes') is not null into v_exists;
  if v_exists then
    v_data := v_data || jsonb_build_object('user_lesson_notes',
      (select coalesce(jsonb_agg(row_to_json(t)),'[]'::jsonb)
       from (select * from public.user_lesson_notes where user_id = p_user_id) t));
  end if;

  -- ── Insert archive snapshot ──
  insert into public.archived_user_data(user_id, data) values (p_user_id, v_data);

  -- ── Delete phase: remove rows (order respects FK deps) ──
  if to_regclass('public.user_lesson_notes') is not null then
    delete from public.user_lesson_notes where user_id = p_user_id;
  end if;
  if to_regclass('public.learning_events') is not null then
    delete from public.learning_events where user_id = p_user_id;
  end if;
  if to_regclass('public.user_lesson_progress') is not null then
    delete from public.user_lesson_progress where user_id = p_user_id;
  end if;
  if to_regclass('public.user_learning_path_progress') is not null then
    delete from public.user_learning_path_progress where user_id = p_user_id;
  end if;
  if to_regclass('public.user_ai_queries') is not null then
    delete from public.user_ai_queries where user_id = p_user_id;
  end if;
  if to_regclass('public.user_usage') is not null then
    delete from public.user_usage where user_id = p_user_id;
  end if;
  if to_regclass('public.subscriptions') is not null then
    delete from public.subscriptions where user_id = p_user_id;
  end if;
  if to_regclass('public.saved_hadith') is not null then
    delete from public.saved_hadith where user_id = p_user_id;
  end if;
  if to_regclass('public.saved_hadiths') is not null then
    delete from public.saved_hadiths where user_id = p_user_id;
  end if;
  if to_regclass('public.saved_collections') is not null then
    delete from public.saved_collections where user_id = p_user_id;
  end if;
  if to_regclass('public.user_folders') is not null then
    delete from public.user_folders where user_id = p_user_id;
  end if;
  if to_regclass('public.user_settings') is not null then
    delete from public.user_settings where user_id = p_user_id;
  end if;
  if to_regclass('public.sahaba_reading_progress') is not null then
    delete from public.sahaba_reading_progress where user_id = p_user_id;
  end if;
  if to_regclass('public.user_streaks') is not null then
    delete from public.user_streaks where user_id = p_user_id;
  end if;
  if to_regclass('public.profiles') is not null then
    delete from public.profiles where id = p_user_id;
  end if;
end;
$$;

-- Only service_role can call this
revoke execute on function public.delete_user_account(uuid) from public;
grant execute on function public.delete_user_account(uuid) to service_role;
