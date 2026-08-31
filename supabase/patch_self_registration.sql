-- ============================================================================
-- PATCH: enables self-registration with a station/department picker.
-- Run this ONCE, after you have already run schema.sql, functions.sql,
-- rls.sql, storage.sql and seed.sql. Safe to run even if some of it was
-- already applied (uses CREATE OR REPLACE / DROP POLICY IF EXISTS).
-- ============================================================================

-- 1. Update the new-user trigger to read station_id/department_id from the
--    sign-up form (role always stays STATION_USER - only an Admin can change it).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_station_id uuid;
  v_department_id uuid;
begin
  begin
    v_station_id := nullif(new.raw_user_meta_data->>'station_id', '')::uuid;
  exception when others then
    v_station_id := null;
  end;

  begin
    v_department_id := nullif(new.raw_user_meta_data->>'department_id', '')::uuid;
  exception when others then
    v_department_id := null;
  end;

  insert into public.profiles (id, full_name, email, role, station_id, department_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'STATION_USER',
    v_station_id,
    v_department_id
  );
  return new;
end;
$$;

-- 2. Allow the registration page (no session yet) to read the station and
--    department lists, so the picker dropdowns can be filled in.
drop policy if exists "reference_read_all" on stations;
create policy "reference_read_all" on stations for select to anon, authenticated using (true);

drop policy if exists "reference_read_all" on departments;
create policy "reference_read_all" on departments for select to anon, authenticated using (true);
