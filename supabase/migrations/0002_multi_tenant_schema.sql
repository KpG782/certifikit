-- =========================================================================
-- 0002_multi_tenant_schema.sql
-- Adds per-user ownership: profiles, templates, certificates, share_tokens,
-- app_config. Adds user_id + certificate_id to email_queue (RLS comes in 0004).
--
-- Run in Supabase SQL Editor (Dashboard → SQL → New query → paste → Run)
-- or via `supabase db push`. Idempotent: every statement is safe to re-run.
-- =========================================================================

-- profiles: 1:1 with auth.users
create table if not exists public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- templates: system templates (user_id null) or user-owned
create table if not exists public.templates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  name         text not null,
  image_path   text not null,  -- supabase storage path OR /certificates/templateN.png for system
  is_system    boolean not null default false,
  is_public    boolean not null default false,
  width_px     integer not null default 1200,
  height_px    integer not null default 850,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint templates_owner_chk
    check ( (is_system and user_id is null) or (not is_system and user_id is not null) )
);

create index if not exists templates_user_id_idx on public.templates (user_id);
create index if not exists templates_is_public_idx on public.templates (is_public) where is_public;

-- Seed the 3 existing filesystem templates as system rows (idempotent).
insert into public.templates (id, user_id, name, image_path, is_system, is_public)
values
  ('00000000-0000-0000-0000-000000000001', null, 'Classic Gold',     '/certificates/template1.png', true, true),
  ('00000000-0000-0000-0000-000000000002', null, 'Modern Blue',      '/certificates/template2.png', true, true),
  ('00000000-0000-0000-0000-000000000003', null, 'Elegant Burgundy', '/certificates/template3.png', true, true)
on conflict (id) do nothing;

-- certificates: persistent user designs (replaces "memory-only editor state")
create table if not exists public.certificates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  template_id  uuid references public.templates(id) on delete set null,
  title        text not null default 'Untitled Certificate',
  payload      jsonb not null,  -- { textElements: [...], imageElements: [...], background: {...} }
  image_url    text,            -- last rendered PNG (storage URL); nullable until first render
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists certificates_user_id_idx
  on public.certificates (user_id, updated_at desc);

-- share_tokens: tamper-proof public share links for certificates
create table if not exists public.share_tokens (
  token          text primary key,  -- url-safe random string
  certificate_id uuid not null references public.certificates(id) on delete cascade,
  created_by     uuid not null references auth.users(id) on delete cascade,
  expires_at     timestamptz,        -- null = never expires
  view_count     bigint not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists share_tokens_certificate_id_idx
  on public.share_tokens (certificate_id);

-- app_config: single-row table for cap values (replaces hardcoded 50/50/20)
create table if not exists public.app_config (
  id              integer primary key default 1,
  queue_cap       integer not null default 50,
  batch_send_cap  integer not null default 50,
  template_cap    integer not null default 20,
  updated_at      timestamptz not null default now(),
  constraint app_config_singleton check (id = 1)
);

insert into public.app_config (id) values (1)
on conflict (id) do nothing;

-- email_queue migration: add user_id, certificate_id, image_url
-- Existing rows get user_id = null (orphaned; safe — they'll be visible only to service_role)
alter table public.email_queue add column if not exists user_id        uuid references auth.users(id) on delete cascade;
alter table public.email_queue add column if not exists certificate_id uuid references public.certificates(id) on delete set null;
alter table public.email_queue add column if not exists image_url      text;

create index if not exists email_queue_user_id_idx
  on public.email_queue (user_id, created_at desc);

-- Drop the legacy NOT NULL on certificate_image so new inserts can use image_url
-- (we keep the column for now; 0003 will drop it after backfill)
alter table public.email_queue alter column certificate_image drop not null;

-- updated_at triggers
create or replace function public.tg_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'profiles_set_updated_at') then
    create trigger profiles_set_updated_at before update on public.profiles
      for each row execute function public.tg_set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'templates_set_updated_at') then
    create trigger templates_set_updated_at before update on public.templates
      for each row execute function public.tg_set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'certificates_set_updated_at') then
    create trigger certificates_set_updated_at before update on public.certificates
      for each row execute function public.tg_set_updated_at();
  end if;
end$$;

-- Auto-create profile row when a new auth.users row appears
create or replace function public.tg_handle_new_user() returns trigger as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'auth_user_created_profile') then
    create trigger auth_user_created_profile
      after insert on auth.users
      for each row execute function public.tg_handle_new_user();
  end if;
end$$;
