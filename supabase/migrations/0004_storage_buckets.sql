-- =========================================================================
-- 0004_storage_buckets.sql
-- Creates the `media` bucket for templates + rendered certificates.
-- Path conventions:
--   templates/{user_id}/{template_id}.png       -- user templates
--   certificates/{user_id}/{certificate_id}.png -- rendered certificates
--   system-templates/{filename}.png             -- migrated system templates (optional)
--
-- Bucket is *private*. Access is granted via:
--   - signed URLs (server creates short-lived URL for the owner / share token)
--   - RLS policies below (direct supabase-js access from authenticated client)
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- Policies live on storage.objects

drop policy if exists "media_select_own"   on storage.objects;
drop policy if exists "media_insert_own"   on storage.objects;
drop policy if exists "media_update_own"   on storage.objects;
drop policy if exists "media_delete_own"   on storage.objects;
drop policy if exists "media_select_system" on storage.objects;

-- Users can read/write objects under templates/<their-uid>/* and certificates/<their-uid>/*
create policy "media_select_own" on storage.objects for select to authenticated using (
  bucket_id = 'media'
  and (
    (storage.foldername(name))[1] in ('templates', 'certificates')
    and (storage.foldername(name))[2] = auth.uid()::text
  )
);

create policy "media_insert_own" on storage.objects for insert to authenticated with check (
  bucket_id = 'media'
  and (
    (storage.foldername(name))[1] in ('templates', 'certificates')
    and (storage.foldername(name))[2] = auth.uid()::text
  )
);

create policy "media_update_own" on storage.objects for update to authenticated using (
  bucket_id = 'media'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "media_delete_own" on storage.objects for delete to authenticated using (
  bucket_id = 'media'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- system-templates/* is readable by anyone authenticated (templates can be shared)
create policy "media_select_system" on storage.objects for select to authenticated using (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = 'system-templates'
);
