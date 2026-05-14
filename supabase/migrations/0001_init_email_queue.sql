-- =========================================================================
-- 0001_init_email_queue.sql
-- Creates the email_queue table backing the certificate email pipeline.
--
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query → paste → Run)
-- or via the Supabase CLI: `supabase db push`.
-- Safe to re-run: every statement is idempotent.
-- =========================================================================

create table if not exists public.email_queue (
  id                  bigint generated always as identity primary key,
  recipient_email     text        not null,
  recipient_name      text        not null,
  subject             text        not null,
  message             text        not null,
  certificate_image   text        not null,   -- base64 data URL of rendered PNG
  status              text        not null default 'pending',
  error_message       text,
  created_at          timestamptz not null default now(),
  sent_at             timestamptz,
  constraint email_queue_status_chk
    check (status in ('pending', 'sending', 'sent', 'failed', 'cancelled'))
);

-- Idempotent upgrade for existing projects: widen the CHECK constraint
-- to include 'cancelled' without dropping/recreating the table.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'email_queue_status_chk'
      and pg_get_constraintdef(oid) not like '%cancelled%'
  ) then
    alter table public.email_queue
      drop constraint email_queue_status_chk;
    alter table public.email_queue
      add constraint email_queue_status_chk
      check (status in ('pending', 'sending', 'sent', 'failed', 'cancelled'));
  end if;
end$$;

create index if not exists email_queue_status_idx
  on public.email_queue (status);

create index if not exists email_queue_created_at_idx
  on public.email_queue (created_at desc);

-- -------------------------------------------------------------------------
-- Row Level Security
--
-- This app currently uses the anon key from the Next.js server. The anon key
-- is shipped to the browser via NEXT_PUBLIC_*, so anyone with access to the
-- deployed site can read it. To keep the queue functional we either disable
-- RLS or add permissive policies. Disabling RLS is the simplest match for the
-- existing "private internal tool with fake client-side auth" threat model
-- documented in CLAUDE.md.
--
-- If you later promote this to a real multi-tenant app, switch the server to
-- the service_role key (see src/lib/db.ts) and re-enable RLS here.
-- -------------------------------------------------------------------------
alter table public.email_queue disable row level security;

-- Drop the deny-all stance from earlier revisions of this file, if present.
drop policy if exists "deny all" on public.email_queue;
