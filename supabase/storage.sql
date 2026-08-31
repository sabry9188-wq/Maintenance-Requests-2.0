-- ============================================================================
-- Maintenance Requests 2.0 - Storage buckets & policies
-- Run this FOURTH, after schema.sql, functions.sql and rls.sql.
-- Files are stored at: {request_id}/{filename} inside each bucket.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('request-photos', 'request-photos', false, 26214400, array['image/jpeg','image/png','image/webp','image/heic','video/mp4','video/quicktime']),
  ('repair-photos', 'repair-photos', false, 26214400, array['image/jpeg','image/png','image/webp','image/heic','video/mp4','video/quicktime']),
  ('completion-docs', 'completion-docs', false, 26214400, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('supporting-docs', 'supporting-docs', false, 26214400, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Helper: is the caller allowed to see/act on the parent request?
-- (mirrors the visibility predicate used in rls.sql for maintenance_requests)
create or replace function storage_can_access_request(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from maintenance_requests r
    where r.id = p_request_id
      and (
        is_admin() or is_engineering() or is_management()
        or (
          is_station_user() and (
            r.requested_by = auth.uid()
            or r.station_id = (select station_id from profiles where id = auth.uid())
            or r.department_id = (select department_id from profiles where id = auth.uid())
          )
        )
      )
  );
$$;

-- ============================================================================
-- request-photos: station users upload on their own request, engineering can too
-- ============================================================================

create policy "request_photos_select" on storage.objects for select to authenticated
  using (bucket_id = 'request-photos' and storage_can_access_request(((storage.foldername(name))[1])::uuid));

create policy "request_photos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'request-photos' and storage_can_access_request(((storage.foldername(name))[1])::uuid));

create policy "request_photos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'request-photos' and (is_admin() or is_engineering()));

-- ============================================================================
-- repair-photos: before/after photos, engineering only writes, same visibility to read
-- ============================================================================

create policy "repair_photos_select" on storage.objects for select to authenticated
  using (bucket_id = 'repair-photos' and storage_can_access_request(((storage.foldername(name))[1])::uuid));

create policy "repair_photos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'repair-photos' and (is_admin() or is_engineering()));

create policy "repair_photos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'repair-photos' and (is_admin() or is_engineering()));

-- ============================================================================
-- completion-docs: engineering-authored completion report evidence
-- ============================================================================

create policy "completion_docs_select" on storage.objects for select to authenticated
  using (bucket_id = 'completion-docs' and storage_can_access_request(((storage.foldername(name))[1])::uuid));

create policy "completion_docs_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'completion-docs' and (is_admin() or is_engineering()));

create policy "completion_docs_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'completion-docs' and (is_admin() or is_engineering()));

-- ============================================================================
-- supporting-docs: either side can attach supporting documents
-- ============================================================================

create policy "supporting_docs_select" on storage.objects for select to authenticated
  using (bucket_id = 'supporting-docs' and storage_can_access_request(((storage.foldername(name))[1])::uuid));

create policy "supporting_docs_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'supporting-docs' and storage_can_access_request(((storage.foldername(name))[1])::uuid));

create policy "supporting_docs_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'supporting-docs' and (is_admin() or is_engineering()));
