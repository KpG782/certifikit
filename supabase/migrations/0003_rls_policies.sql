-- =========================================================================
-- 0003_rls_policies.sql
-- Enables RLS on every public table and adds per-user policies.
-- Service-role key continues to bypass RLS (intentional — used by n8n callback
-- and admin operations). The Next.js server should use the per-request user
-- session (via @supabase/ssr) for all user-facing reads/writes.
-- =========================================================================

-- profiles: owner can read + update; anyone authenticated can read public name
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;

create policy "profiles_select_own"  on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "profiles_update_own"  on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (auth.uid() = user_id);

-- templates: system templates readable by anyone authenticated; owner CRUD on own
alter table public.templates enable row level security;

drop policy if exists "templates_select_visible" on public.templates;
drop policy if exists "templates_insert_own"     on public.templates;
drop policy if exists "templates_update_own"     on public.templates;
drop policy if exists "templates_delete_own"     on public.templates;

create policy "templates_select_visible" on public.templates for select to authenticated using (is_system or is_public or user_id = auth.uid());
create policy "templates_insert_own"     on public.templates for insert to authenticated with check (user_id = auth.uid() and not is_system);
create policy "templates_update_own"     on public.templates for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and not is_system);
create policy "templates_delete_own"     on public.templates for delete to authenticated using (user_id = auth.uid() and not is_system);

-- certificates: strict owner-only CRUD
alter table public.certificates enable row level security;

drop policy if exists "certificates_select_own" on public.certificates;
drop policy if exists "certificates_insert_own" on public.certificates;
drop policy if exists "certificates_update_own" on public.certificates;
drop policy if exists "certificates_delete_own" on public.certificates;

create policy "certificates_select_own" on public.certificates for select to authenticated using (user_id = auth.uid());
create policy "certificates_insert_own" on public.certificates for insert to authenticated with check (user_id = auth.uid());
create policy "certificates_update_own" on public.certificates for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "certificates_delete_own" on public.certificates for delete to authenticated using (user_id = auth.uid());

-- share_tokens: owner CRUD; public read happens via service-role through
-- /api/share/[token] (not via direct anon-key access, so no anon policy).
alter table public.share_tokens enable row level security;

drop policy if exists "share_tokens_select_own" on public.share_tokens;
drop policy if exists "share_tokens_insert_own" on public.share_tokens;
drop policy if exists "share_tokens_delete_own" on public.share_tokens;

create policy "share_tokens_select_own" on public.share_tokens for select to authenticated using (created_by = auth.uid());
create policy "share_tokens_insert_own" on public.share_tokens for insert to authenticated with check (created_by = auth.uid());
create policy "share_tokens_delete_own" on public.share_tokens for delete to authenticated using (created_by = auth.uid());

-- email_queue: owner-scoped; legacy rows with user_id null are visible only to service_role
alter table public.email_queue enable row level security;

drop policy if exists "email_queue_select_own" on public.email_queue;
drop policy if exists "email_queue_insert_own" on public.email_queue;
drop policy if exists "email_queue_update_own" on public.email_queue;
drop policy if exists "email_queue_delete_own" on public.email_queue;

create policy "email_queue_select_own" on public.email_queue for select to authenticated using (user_id = auth.uid());
create policy "email_queue_insert_own" on public.email_queue for insert to authenticated with check (user_id = auth.uid());
create policy "email_queue_update_own" on public.email_queue for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "email_queue_delete_own" on public.email_queue for delete to authenticated using (user_id = auth.uid());

-- app_config: readable by all authenticated users; only service-role writes
alter table public.app_config enable row level security;

drop policy if exists "app_config_select_all" on public.app_config;

create policy "app_config_select_all" on public.app_config for select to authenticated using (true);
-- (no insert/update/delete policies — service_role bypasses, regular users blocked)
