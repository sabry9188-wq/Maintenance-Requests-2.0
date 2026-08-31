-- ============================================================================
-- Maintenance Requests 2.0 - DEMO data (optional)
-- Run this LAST, only for testing/demo purposes - NOT for production.
-- Creates demo login accounts (see credentials below) and realistic sample
-- maintenance requests across all 7 stations so every dashboard/report has
-- something to show immediately after setup.
--
-- All demo accounts use the password:  Demo12345!
-- ============================================================================

do $$
declare
  v_station01 uuid; v_station02 uuid; v_station03 uuid; v_station04 uuid; v_station05 uuid;
  v_dept_hatchery uuid; v_dept_nursery uuid; v_dept_lab uuid; v_dept_seacage uuid; v_dept_eng uuid;
  v_area_h1 uuid; v_area_n2 uuid; v_area_lab uuid; v_area_cage uuid;
  v_cat_water uuid; v_cat_tanks uuid; v_cat_aeration uuid; v_cat_lab uuid; v_cat_cages uuid; v_cat_gen uuid;
  v_pt_pump uuid; v_pt_overflow uuid; v_pt_blower uuid; v_pt_fridge uuid; v_pt_mooring uuid; v_pt_genfail uuid;
  v_user_station01 uuid; v_user_station02 uuid; v_user_station03 uuid; v_user_station04 uuid; v_user_station05 uuid;
  v_user_eng_manager uuid; v_user_tech1 uuid; v_user_tech2 uuid; v_user_management uuid; v_user_admin uuid;
  v_req1 uuid; v_req2 uuid; v_req3 uuid; v_req4 uuid; v_req5 uuid; v_req6 uuid; v_req7 uuid;
begin
  select id into v_station01 from stations where code = '01';
  select id into v_station02 from stations where code = '02';
  select id into v_station03 from stations where code = '03';
  select id into v_station04 from stations where code = '04';
  select id into v_station05 from stations where code = '05';

  select id into v_dept_hatchery from departments where name = 'Hatchery';
  select id into v_dept_nursery from departments where name = 'Nursery';
  select id into v_dept_lab from departments where name = 'Laboratory';
  select id into v_dept_seacage from departments where name = 'Sea Cage Farm';
  select id into v_dept_eng from departments where name = 'Engineering / Maintenance';

  select id into v_area_h1 from areas where station_id = v_station01 and name = 'Hatchery Larval Rearing Room';
  select id into v_area_n2 from areas where station_id = v_station02 and name = 'Nursery Tank Room 1';
  select id into v_area_lab from areas where station_id = v_station04 and name = 'Laboratory - Water Quality';
  select id into v_area_cage from areas where station_id = v_station05 and name = 'Cage Block A';

  select id into v_cat_water from maintenance_categories where name = 'Water Supply';
  select id into v_cat_tanks from maintenance_categories where name = 'Tanks';
  select id into v_cat_aeration from maintenance_categories where name = 'Aeration';
  select id into v_cat_lab from maintenance_categories where name = 'Laboratory';
  select id into v_cat_cages from maintenance_categories where name = 'Floating Cages';
  select id into v_cat_gen from maintenance_categories where name = 'Generators / Power';

  select id into v_pt_pump from maintenance_problem_types where category_id = v_cat_water and name = 'Water pump failure';
  select id into v_pt_overflow from maintenance_problem_types where category_id = v_cat_tanks and name = 'Tank overflow';
  select id into v_pt_blower from maintenance_problem_types where category_id = v_cat_aeration and name = 'Blower failure';
  select id into v_pt_fridge from maintenance_problem_types where category_id = v_cat_lab and name = 'Refrigerator / freezer problem';
  select id into v_pt_mooring from maintenance_problem_types where category_id = v_cat_cages and name = 'Mooring problem';
  select id into v_pt_genfail from maintenance_problem_types where category_id = v_cat_gen and name = 'Generator failure';

  -- ==========================================================================
  -- Demo auth users (email/password login) + profiles
  -- ==========================================================================

  perform 1 from auth.users where email = 'station01@demo.local';
  if not found then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'station01@demo.local', crypt('Demo12345!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Station 01 User"}', now(), now(),
      '', '', '', ''
    ) returning id into v_user_station01;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
    values (gen_random_uuid(), v_user_station01, v_user_station01::text,
      jsonb_build_object('sub', v_user_station01::text, 'email', 'station01@demo.local'), 'email', now(), now());
  else
    select id into v_user_station01 from auth.users where email = 'station01@demo.local';
  end if;

  perform 1 from auth.users where email = 'station02@demo.local';
  if not found then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'station02@demo.local', crypt('Demo12345!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Station 02 User"}', now(), now(),
      '', '', '', ''
    ) returning id into v_user_station02;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
    values (gen_random_uuid(), v_user_station02, v_user_station02::text,
      jsonb_build_object('sub', v_user_station02::text, 'email', 'station02@demo.local'), 'email', now(), now());
  else
    select id into v_user_station02 from auth.users where email = 'station02@demo.local';
  end if;

  perform 1 from auth.users where email = 'station04@demo.local';
  if not found then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'station04@demo.local', crypt('Demo12345!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Station 04 User"}', now(), now(),
      '', '', '', ''
    ) returning id into v_user_station04;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
    values (gen_random_uuid(), v_user_station04, v_user_station04::text,
      jsonb_build_object('sub', v_user_station04::text, 'email', 'station04@demo.local'), 'email', now(), now());
  else
    select id into v_user_station04 from auth.users where email = 'station04@demo.local';
  end if;

  perform 1 from auth.users where email = 'station05@demo.local';
  if not found then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'station05@demo.local', crypt('Demo12345!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Station 05 User"}', now(), now(),
      '', '', '', ''
    ) returning id into v_user_station05;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
    values (gen_random_uuid(), v_user_station05, v_user_station05::text,
      jsonb_build_object('sub', v_user_station05::text, 'email', 'station05@demo.local'), 'email', now(), now());
  else
    select id into v_user_station05 from auth.users where email = 'station05@demo.local';
  end if;

  perform 1 from auth.users where email = 'engineering.manager@demo.local';
  if not found then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'engineering.manager@demo.local', crypt('Demo12345!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Engineering Manager"}', now(), now(),
      '', '', '', ''
    ) returning id into v_user_eng_manager;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
    values (gen_random_uuid(), v_user_eng_manager, v_user_eng_manager::text,
      jsonb_build_object('sub', v_user_eng_manager::text, 'email', 'engineering.manager@demo.local'), 'email', now(), now());
  else
    select id into v_user_eng_manager from auth.users where email = 'engineering.manager@demo.local';
  end if;

  perform 1 from auth.users where email = 'technician1@demo.local';
  if not found then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'technician1@demo.local', crypt('Demo12345!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Technician A"}', now(), now(),
      '', '', '', ''
    ) returning id into v_user_tech1;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
    values (gen_random_uuid(), v_user_tech1, v_user_tech1::text,
      jsonb_build_object('sub', v_user_tech1::text, 'email', 'technician1@demo.local'), 'email', now(), now());
  else
    select id into v_user_tech1 from auth.users where email = 'technician1@demo.local';
  end if;

  perform 1 from auth.users where email = 'technician2@demo.local';
  if not found then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'technician2@demo.local', crypt('Demo12345!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Technician B"}', now(), now(),
      '', '', '', ''
    ) returning id into v_user_tech2;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
    values (gen_random_uuid(), v_user_tech2, v_user_tech2::text,
      jsonb_build_object('sub', v_user_tech2::text, 'email', 'technician2@demo.local'), 'email', now(), now());
  else
    select id into v_user_tech2 from auth.users where email = 'technician2@demo.local';
  end if;

  perform 1 from auth.users where email = 'management@demo.local';
  if not found then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'management@demo.local', crypt('Demo12345!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Management Viewer"}', now(), now(),
      '', '', '', ''
    ) returning id into v_user_management;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
    values (gen_random_uuid(), v_user_management, v_user_management::text,
      jsonb_build_object('sub', v_user_management::text, 'email', 'management@demo.local'), 'email', now(), now());
  else
    select id into v_user_management from auth.users where email = 'management@demo.local';
  end if;

  -- Assign roles/station/department on the profiles created automatically by
  -- the handle_new_user() trigger (auth.uid() is null in this script context,
  -- so the privileged-field guard trigger allows these updates - see functions.sql).
  update profiles set role = 'STATION_USER', station_id = v_station01, department_id = v_dept_hatchery where id = v_user_station01;
  update profiles set role = 'STATION_USER', station_id = v_station02, department_id = v_dept_nursery where id = v_user_station02;
  update profiles set role = 'STATION_USER', station_id = v_station04, department_id = v_dept_lab where id = v_user_station04;
  update profiles set role = 'STATION_USER', station_id = v_station05, department_id = v_dept_seacage where id = v_user_station05;
  update profiles set role = 'ENGINEERING_MANAGER', department_id = v_dept_eng where id = v_user_eng_manager;
  update profiles set role = 'ENGINEER', department_id = v_dept_eng where id = v_user_tech1;
  update profiles set role = 'ENGINEER', department_id = v_dept_eng where id = v_user_tech2;
  update profiles set role = 'MANAGEMENT_VIEW_ONLY' where id = v_user_management;

  -- ==========================================================================
  -- Demo assets
  -- ==========================================================================

  insert into assets (asset_code, name, station_id, department_id, area_id, equipment_type, manufacturer, status, criticality)
  values
    ('ST01-PUMP-001', 'Seawater Circulation Pump 1', v_station01, v_dept_hatchery, v_area_h1, 'Pump', 'Grundfos', 'OPERATIONAL', 'HIGH'),
    ('ST02-TANK-004', 'Nursery Tank 04', v_station02, v_dept_nursery, v_area_n2, 'Tank', null, 'OPERATIONAL', 'MEDIUM'),
    ('ST04-FRIDGE-001', 'Laboratory Refrigerator', v_station04, v_dept_lab, v_area_lab, 'Refrigerator', 'Samsung', 'OPERATIONAL', 'MEDIUM'),
    ('ST05-GEN-001', 'Diesel Generator 1', v_station05, v_dept_seacage, null, 'Generator', 'Cummins', 'OPERATIONAL', 'CRITICAL'),
    ('ST05-CAGE-A01', 'Floating Cage A1', v_station05, v_dept_seacage, v_area_cage, 'Cage', null, 'OPERATIONAL', 'HIGH')
  on conflict (asset_code) do nothing;

  -- ==========================================================================
  -- Demo maintenance requests (varied stations, statuses, priorities)
  -- ==========================================================================

  insert into maintenance_requests (
    requested_by, station_id, department_id, area_id, category_id, problem_type_id,
    priority, status, problem_title, problem_description, problem_started_at,
    is_operational, operational_impact, safety_risk, production_impact,
    assigned_technician_id, acknowledged_at, assigned_at, started_at
  ) values (
    v_user_station01, v_station01, v_dept_hatchery, v_area_h1, v_cat_water, v_pt_pump,
    'CRITICAL', 'IN_PROGRESS', 'Hatchery seawater pump failure',
    'The seawater circulation pump for the larval rearing room stopped working this morning. Water flow to the tanks has stopped.',
    now() - interval '1 day 3 hours', 'NO', 'OPERATION_STOPPED', true, true,
    v_user_tech1, now() - interval '1 day 2 hours 50 minutes', now() - interval '1 day 2 hours 30 minutes', now() - interval '1 day 2 hours'
  ) returning id into v_req1;

  insert into maintenance_requests (
    requested_by, station_id, department_id, area_id, category_id, problem_type_id,
    priority, status, problem_title, problem_description, problem_started_at,
    is_operational, operational_impact, safety_risk, production_impact
  ) values (
    v_user_station02, v_station02, v_dept_nursery, v_area_n2, (select id from maintenance_categories where name = 'Tanks'), v_pt_overflow,
    'HIGH', 'SUBMITTED', 'Nursery tank overflow valve problem',
    'Tank 04 overflow valve is stuck open and water is overflowing onto the floor.',
    now() - interval '2 hours', 'PARTIALLY', 'MODERATE', false, true
  ) returning id into v_req2;

  insert into maintenance_requests (
    requested_by, station_id, department_id, category_id, problem_type_id,
    priority, status, problem_title, problem_description, problem_started_at,
    is_operational, operational_impact, safety_risk, production_impact,
    assigned_technician_id, acknowledged_at, assigned_at, started_at, completed_at
  ) values (
    v_user_station02, v_station02, v_dept_nursery, v_cat_aeration, v_pt_blower,
    'HIGH', 'PENDING_CONFIRMATION', 'Nursery aeration blower problem',
    'Aeration blower for Tank Room 2 is making a loud noise and output pressure has dropped.',
    now() - interval '3 days', 'PARTIALLY', 'MINOR', false, true,
    v_user_tech2, now() - interval '2 days 22 hours', now() - interval '2 days 20 hours',
    now() - interval '2 days 18 hours', now() - interval '2 days 10 hours'
  ) returning id into v_req3;

  insert into maintenance_requests (
    requested_by, station_id, department_id, area_id, category_id, problem_type_id,
    priority, status, problem_title, problem_description, problem_started_at,
    is_operational, operational_impact, safety_risk, production_impact
  ) values (
    v_user_station04, v_station04, v_dept_lab, v_area_lab, v_cat_lab, v_pt_fridge,
    'MEDIUM', 'ACKNOWLEDGED', 'Laboratory refrigerator failure',
    'The laboratory sample refrigerator is not maintaining temperature - reading 12C instead of 4C.',
    now() - interval '6 hours', 'NO', 'MODERATE', false, false
  ) returning id into v_req4;

  insert into maintenance_requests (
    requested_by, station_id, department_id, area_id, category_id, problem_type_id,
    priority, status, problem_title, problem_description, problem_started_at,
    is_operational, operational_impact, safety_risk, production_impact,
    assigned_technician_id, acknowledged_at, assigned_at, started_at, completed_at, confirmed_at, closed_at
  ) values (
    v_user_station05, v_station05, v_dept_seacage, v_area_cage, v_cat_cages, v_pt_mooring,
    'HIGH', 'CLOSED', 'Sea cage mooring rope damage',
    'Mooring rope on Cage Block A, position 3, is frayed and at risk of failure.',
    now() - interval '10 days', 'YES', 'MINOR', true, false,
    v_user_tech1, now() - interval '9 days 22 hours', now() - interval '9 days 20 hours',
    now() - interval '9 days 18 hours', now() - interval '9 days 10 hours',
    now() - interval '9 days 2 hours', now() - interval '9 days 1 hour'
  ) returning id into v_req5;

  insert into maintenance_requests (
    requested_by, station_id, department_id, category_id, problem_type_id,
    priority, status, problem_title, problem_description, problem_started_at,
    is_operational, operational_impact, safety_risk, production_impact,
    assigned_technician_id, acknowledged_at, assigned_at
  ) values (
    v_user_station05, v_station05, v_dept_seacage, v_cat_gen, v_pt_genfail,
    'CRITICAL', 'WAITING_FOR_PARTS', 'Generator battery failure',
    'Generator 1 will not start - suspected dead battery. This generator supplies the feed store and cold room.',
    now() - interval '1 day', 'NO', 'MAJOR', false, true,
    v_user_tech2, now() - interval '23 hours', now() - interval '22 hours'
  ) returning id into v_req6;

  insert into maintenance_requests (
    requested_by, station_id, department_id, category_id, problem_type_id,
    priority, status, problem_title, problem_description, problem_started_at,
    is_operational, operational_impact, safety_risk, production_impact
  ) values (
    v_user_station05, v_station05, v_dept_seacage, (select id from maintenance_categories where name = 'Feeding Equipment'),
    (select id from maintenance_problem_types where category_id = (select id from maintenance_categories where name = 'Feeding Equipment') and name = 'Feed blower problem'),
    'MEDIUM', 'REJECTED', 'Feed blower problem',
    'Feed blower for Cage Block B seems underpowered, feed is not reaching the far cages.',
    now() - interval '5 days', 'PARTIALLY', 'MINOR', false, true
  ) returning id into v_req7;
  update maintenance_requests set rejection_reason = 'Duplicate of request already logged and scheduled for inspection.' where id = v_req7;

  -- ==========================================================================
  -- Work updates, parts used, feedback for the more advanced demo requests
  -- ==========================================================================

  insert into maintenance_request_updates (request_id, technician_id, update_type, work_status, diagnosis, action_taken)
  values (v_req1, v_user_tech1, 'WORK_UPDATE', 'IN_PROGRESS', 'Pump motor bearing failure suspected.', 'Removed pump for inspection.');

  insert into maintenance_request_updates (
    request_id, technician_id, update_type, work_status, root_cause, problem_found, work_performed,
    downtime_minutes, total_labour_hours, external_contractor_used, final_remarks
  ) values (
    v_req3, v_user_tech2, 'COMPLETION_REPORT', 'COMPLETED', 'Blower bearing worn out from age.',
    'Bearing was worn and causing excess vibration and noise.', 'Replaced blower bearing and re-balanced fan assembly.',
    480, 3.5, false, 'Blower running normally, noise and vibration resolved.'
  );

  insert into maintenance_request_parts (request_id, part_name, part_number, quantity, unit, unit_cost, remarks) values
    (v_req3, 'Blower Bearing 6205', '6205-2RS', 2, 'pcs', 40.00, 'Replaced both bearings'),
    (v_req5, 'Mooring Rope 16mm', 'ROPE-16MM', 15, 'm', 8.50, 'Replacement mooring line');

  insert into feedback (request_id, submitted_by, problem_solved, rating, comment)
  values (v_req5, v_user_station05, 'YES', 5, 'Quick response, rope replaced and cage is secure again.');

  -- Extra timeline entries for the closed request so the detail page shows a full history
  insert into maintenance_request_history (request_id, actor_id, action, comment, created_at) values
    (v_req5, v_user_tech1, 'WORK_UPDATE', 'Inspected mooring point and identified frayed section.', now() - interval '9 days 15 hours'),
    (v_req5, v_user_tech1, 'WORK_UPDATE', 'Replacement rope ordered from store.', now() - interval '9 days 12 hours'),
    (v_req5, v_user_station05, 'FEEDBACK_SUBMITTED', 'Rating: 5 - Quick response, rope replaced and cage is secure again.', now() - interval '9 days');

end $$;
