-- =========================================================================
-- 0005_realtime_and_retry.sql
-- (1) Enables Supabase Realtime on email_queue so the dashboard updates
--     instantly instead of polling.
-- (2) Adds retry bookkeeping columns for the failed-send backoff job.
--
-- Idempotent. Run after 0002–0004.
-- =========================================================================

-- (1) Realtime publication. RLS still applies to the realtime stream, so
-- authenticated users only receive change events for their own rows.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'email_queue'
  ) then
    alter publication supabase_realtime add table public.email_queue;
  end if;
end$$;

-- (2) Retry bookkeeping
alter table public.email_queue add column if not exists retry_count    integer     not null default 0;
alter table public.email_queue add column if not exists next_retry_at  timestamptz;
alter table public.email_queue add column if not exists last_attempt_at timestamptz;

create index if not exists email_queue_next_retry_idx
  on public.email_queue (next_retry_at)
  where status = 'failed' and next_retry_at is not null;
