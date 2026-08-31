-- ============================================================================
-- PATCH: Admins now also get notified when a new request is submitted or a
-- request is reopened (previously only ENGINEERING_MANAGER/ENGINEER did).
-- Run this ONCE. Safe to run even if applied before.
-- ============================================================================

create or replace function notify_engineering_team(
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
  where role in ('ENGINEERING_MANAGER', 'ENGINEER', 'ADMIN') and is_active = true;
end;
$$;
