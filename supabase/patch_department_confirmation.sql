-- ============================================================================
-- PATCH: completion notifications go to the whole requesting department
-- (not just the original requester), and anyone in that department can
-- confirm/reopen the request or leave feedback.
-- Run this ONCE, after schema.sql, functions.sql, rls.sql, storage.sql and
-- seed.sql. Safe to run even if applied before.
-- ============================================================================

-- 1. New function: notify every active user in a department.
create or replace function notify_department(
  p_department_id uuid,
  p_request_id uuid,
  p_type notification_type,
  p_title text,
  p_body text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (recipient_id, request_id, type, title, body)
  select id, p_request_id, p_type, p_title, p_body
  from profiles
  where department_id = p_department_id and is_active = true;
end;
$$;

-- 2. Allow confirm/reopen by anyone in the same department, not just the
--    same station or the exact original requester.
drop policy if exists "requests_update_station_confirmation" on maintenance_requests;
create policy "requests_update_station_confirmation" on maintenance_requests for update to authenticated
  using (
    is_station_user()
    and status in ('PENDING_CONFIRMATION', 'COMPLETED')
    and (
      requested_by = auth.uid()
      or station_id = (select station_id from profiles where id = auth.uid())
      or department_id = (select department_id from profiles where id = auth.uid())
    )
  )
  with check (
    is_station_user()
    and status in ('CLOSED', 'REOPENED', 'PENDING_CONFIRMATION')
  );

-- 3. Allow feedback from anyone in the same department too.
drop policy if exists "feedback_insert_requester" on feedback;
create policy "feedback_insert_requester" on feedback for insert to authenticated
  with check (
    submitted_by = auth.uid()
    and exists (
      select 1 from maintenance_requests r
      where r.id = request_id
        and r.status in ('PENDING_CONFIRMATION', 'CLOSED')
        and (
          r.requested_by = auth.uid()
          or r.station_id = (select station_id from profiles where id = auth.uid())
          or r.department_id = (select department_id from profiles where id = auth.uid())
        )
    )
  );
