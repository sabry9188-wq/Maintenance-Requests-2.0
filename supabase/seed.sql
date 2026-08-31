-- ============================================================================
-- Maintenance Requests 2.0 - Seed data (stations, departments, areas,
-- categories, problem types, SLA config, status-transition graph)
-- Run this FIFTH, after schema.sql, functions.sql, rls.sql, storage.sql.
-- Safe to re-run: uses ON CONFLICT DO NOTHING throughout.
-- ============================================================================

-- ============================================================================
-- Stations 01-07
-- ============================================================================

insert into stations (code, name, description) values
  ('01', 'Station 01', 'Hatchery and Nursery operations'),
  ('02', 'Station 02', 'Nursery operations'),
  ('03', 'Station 03', 'Nursery operations'),
  ('04', 'Station 04', 'Laboratory and Nursery operations'),
  ('05', 'Station 05', 'Sea Cage Farm operations'),
  ('06', 'Station 06', 'General station / facility operations'),
  ('07', 'Station 07', 'General station / facility operations')
on conflict (code) do nothing;

-- ============================================================================
-- Departments
-- ============================================================================

insert into departments (name, description) values
  ('Hatchery', 'Larval rearing and broodstock operations'),
  ('Nursery', 'Juvenile rearing operations'),
  ('Sea Cage Farm', 'Floating cage grow-out operations'),
  ('Laboratory', 'Water quality and analytical laboratory'),
  ('Engineering / Maintenance', 'Maintenance and engineering department'),
  ('Administration', 'Administration and support functions'),
  ('Other', 'Other / unspecified department')
on conflict (name) do nothing;

-- ============================================================================
-- Areas (representative starting set - Admin can add/edit more)
-- ============================================================================

insert into areas (station_id, name, description)
select s.code, a.name, a.description
from (values
  ('01', 'Hatchery Larval Rearing Room', null),
  ('01', 'Hatchery Broodstock Room', null),
  ('01', 'Nursery Tank Room 1', null),
  ('01', 'Nursery Tank Room 2', null),
  ('02', 'Nursery Tank Room 1', null),
  ('02', 'Nursery Tank Room 2', null),
  ('02', 'Nursery Water Treatment Room', null),
  ('03', 'Nursery Tank Room 1', null),
  ('03', 'Nursery Tank Room 2', null),
  ('03', 'Nursery Pump House', null),
  ('04', 'Laboratory - Water Quality', null),
  ('04', 'Laboratory - Microbiology', null),
  ('04', 'Nursery Tank Room', null),
  ('05', 'Cage Block A', null),
  ('05', 'Cage Block B', null),
  ('05', 'Feed Store', null),
  ('05', 'Boat Jetty', null),
  ('05', 'Generator House', null),
  ('06', 'Main Building', null),
  ('06', 'Workshop', null),
  ('06', 'Store', null),
  ('06', 'Generator House', null),
  ('07', 'Main Building', null),
  ('07', 'Workshop', null),
  ('07', 'Store', null),
  ('07', 'Generator House', null)
) as a(station_code, name, description)
join stations s on s.code = a.station_code
on conflict do nothing;

-- ============================================================================
-- SLA configuration (Admin-editable afterwards)
-- ============================================================================

insert into sla_config (priority, response_time_minutes, description) values
  ('CRITICAL', 0, 'Immediate response required'),
  ('HIGH', 120, 'Respond within 2 hours'),
  ('MEDIUM', 480, 'Respond within 8 hours'),
  ('LOW', 1440, 'Respond within 24 hours')
on conflict (priority) do nothing;

-- ============================================================================
-- Maintenance categories
-- ============================================================================

insert into maintenance_categories (name, applies_to, sort_order) values
  ('Tanks', 'HATCHERY_NURSERY', 10),
  ('Water Supply', 'HATCHERY_NURSERY', 20),
  ('Aeration', 'HATCHERY_NURSERY', 30),
  ('Electrical', 'HATCHERY_NURSERY', 40),
  ('Mechanical', 'HATCHERY_NURSERY', 50),
  ('Environmental Control', 'HATCHERY_NURSERY', 60),
  ('Building / Facility', 'HATCHERY_NURSERY', 70),
  ('Laboratory', 'LABORATORY', 80),
  ('Floating Cages', 'SEA_CAGE', 90),
  ('Nets', 'SEA_CAGE', 100),
  ('Feeding Equipment', 'SEA_CAGE', 110),
  ('Boats', 'SEA_CAGE', 120),
  ('Diving Equipment', 'SEA_CAGE', 130),
  ('Crane / Lifting Equipment', 'SEA_CAGE', 140),
  ('Generators / Power', 'SEA_CAGE', 150),
  ('Feed Store / Facilities', 'SEA_CAGE', 160),
  ('Communication', 'SEA_CAGE', 170),
  ('Plumbing', 'GENERAL', 180),
  ('Civil / Building', 'GENERAL', 190),
  ('HVAC', 'GENERAL', 200),
  ('Generator', 'GENERAL', 210),
  ('Pumps', 'GENERAL', 220),
  ('Vehicles', 'GENERAL', 230),
  ('Safety', 'GENERAL', 240),
  ('IT / Network', 'GENERAL', 250),
  ('Equipment', 'GENERAL', 260),
  ('Structural', 'GENERAL', 270),
  ('Welding', 'GENERAL', 280),
  ('Fabrication', 'GENERAL', 290),
  ('Preventive Maintenance', 'GENERAL', 300),
  ('Other', 'GENERAL', 310)
on conflict (name) do nothing;

-- ============================================================================
-- Problem types (grouped by category)
-- ============================================================================

with pt(category_name, name, sort_order) as (
  values
  -- Tanks
  ('Tanks', 'Tank leakage', 10),
  ('Tanks', 'Tank crack', 20),
  ('Tanks', 'Tank overflow', 30),
  ('Tanks', 'Tank drain blockage', 40),
  ('Tanks', 'Tank valve problem', 50),
  ('Tanks', 'Tank pipe problem', 60),
  ('Tanks', 'Tank cleaning system problem', 70),
  ('Tanks', 'Tank structural damage', 80),
  -- Water Supply
  ('Water Supply', 'Water pump failure', 10),
  ('Water Supply', 'Pump vibration', 20),
  ('Water Supply', 'Low water pressure', 30),
  ('Water Supply', 'Water flow problem', 40),
  ('Water Supply', 'Pipe leakage', 50),
  ('Water Supply', 'Pipe blockage', 60),
  ('Water Supply', 'Valve failure', 70),
  ('Water Supply', 'Plumbing problem', 80),
  ('Water Supply', 'Seawater intake problem', 90),
  ('Water Supply', 'Freshwater supply problem', 100),
  -- Aeration
  ('Aeration', 'Blower failure', 10),
  ('Aeration', 'Air pump failure', 20),
  ('Aeration', 'Air pipe leakage', 30),
  ('Aeration', 'Low air pressure', 40),
  ('Aeration', 'Diffuser problem', 50),
  ('Aeration', 'Oxygen system problem', 60),
  -- Electrical
  ('Electrical', 'Power failure', 10),
  ('Electrical', 'Electrical panel problem', 20),
  ('Electrical', 'MCB / trip problem', 30),
  ('Electrical', 'Cable damage', 40),
  ('Electrical', 'Socket problem', 50),
  ('Electrical', 'Lighting problem', 60),
  ('Electrical', 'Generator problem', 70),
  ('Electrical', 'Control panel problem', 80),
  -- Mechanical
  ('Mechanical', 'Motor failure', 10),
  ('Mechanical', 'Pump motor problem', 20),
  ('Mechanical', 'Bearing problem', 30),
  ('Mechanical', 'Belt problem', 40),
  ('Mechanical', 'Gearbox problem', 50),
  ('Mechanical', 'Fan problem', 60),
  ('Mechanical', 'Compressor problem', 70),
  -- Environmental Control
  ('Environmental Control', 'Chiller problem', 10),
  ('Environmental Control', 'Heater problem', 20),
  ('Environmental Control', 'Temperature control problem', 30),
  ('Environmental Control', 'Cooling system problem', 40),
  ('Environmental Control', 'HVAC problem', 50),
  -- Building / Facility
  ('Building / Facility', 'Door problem', 10),
  ('Building / Facility', 'Window problem', 20),
  ('Building / Facility', 'Roof problem', 30),
  ('Building / Facility', 'Floor damage', 40),
  ('Building / Facility', 'Wall damage', 50),
  ('Building / Facility', 'Drainage problem', 60),
  ('Building / Facility', 'Plumbing problem', 70),
  ('Building / Facility', 'Water leakage', 80),
  -- Laboratory
  ('Laboratory', 'Laboratory equipment failure', 10),
  ('Laboratory', 'Microscope problem', 20),
  ('Laboratory', 'Incubator problem', 30),
  ('Laboratory', 'Refrigerator / freezer problem', 40),
  ('Laboratory', 'Water quality equipment problem', 50),
  ('Laboratory', 'DO meter problem', 60),
  ('Laboratory', 'pH meter problem', 70),
  ('Laboratory', 'Salinity meter problem', 80),
  ('Laboratory', 'Analytical equipment problem', 90),
  ('Laboratory', 'Electrical problem', 100),
  ('Laboratory', 'HVAC problem', 110),
  ('Laboratory', 'Water supply problem', 120),
  ('Laboratory', 'Laboratory sink / drain problem', 130),
  ('Laboratory', 'Safety equipment problem', 140),
  -- Floating Cages
  ('Floating Cages', 'Cage frame damage', 10),
  ('Floating Cages', 'HDPE pipe problem', 20),
  ('Floating Cages', 'Walkway problem', 30),
  ('Floating Cages', 'Handrail problem', 40),
  ('Floating Cages', 'Cage connection problem', 50),
  ('Floating Cages', 'Mooring problem', 60),
  ('Floating Cages', 'Buoy problem', 70),
  ('Floating Cages', 'Anchor / rope problem', 80),
  ('Floating Cages', 'Shackles / fittings problem', 90),
  -- Nets
  ('Nets', 'Net damage', 10),
  ('Nets', 'Net tear', 20),
  ('Nets', 'Net hole', 30),
  ('Nets', 'Net installation problem', 40),
  ('Nets', 'Net replacement required', 50),
  ('Nets', 'Predator / guard net problem', 60),
  ('Nets', 'Net cleaning equipment problem', 70),
  -- Feeding Equipment
  ('Feeding Equipment', 'Feed blower problem', 10),
  ('Feeding Equipment', 'Feed system problem', 20),
  ('Feeding Equipment', 'Feed pipe problem', 30),
  ('Feeding Equipment', 'Feed dispenser problem', 40),
  ('Feeding Equipment', 'Feeding boat equipment problem', 50),
  -- Boats
  ('Boats', 'Engine problem', 10),
  ('Boats', 'Fuel system problem', 20),
  ('Boats', 'Battery problem', 30),
  ('Boats', 'Electrical problem', 40),
  ('Boats', 'Navigation equipment problem', 50),
  ('Boats', 'Pump problem', 60),
  ('Boats', 'Steering problem', 70),
  ('Boats', 'Bilge pump problem', 80),
  -- Diving Equipment
  ('Diving Equipment', 'Compressor problem', 10),
  ('Diving Equipment', 'Diving equipment problem', 20),
  ('Diving Equipment', 'Air hose problem', 30),
  ('Diving Equipment', 'Diving equipment storage problem', 40),
  -- Crane / Lifting Equipment
  ('Crane / Lifting Equipment', 'Crane failure', 10),
  ('Crane / Lifting Equipment', 'Hydraulic problem', 20),
  ('Crane / Lifting Equipment', 'Winch problem', 30),
  ('Crane / Lifting Equipment', 'Wire rope problem', 40),
  ('Crane / Lifting Equipment', 'Lifting equipment problem', 50),
  -- Generators / Power
  ('Generators / Power', 'Generator failure', 10),
  ('Generators / Power', 'Fuel system problem', 20),
  ('Generators / Power', 'Battery problem', 30),
  ('Generators / Power', 'Starter problem', 40),
  ('Generators / Power', 'Electrical panel problem', 50),
  -- Feed Store / Facilities
  ('Feed Store / Facilities', 'Feed store door problem', 10),
  ('Feed Store / Facilities', 'Roof leakage', 20),
  ('Feed Store / Facilities', 'Ventilation problem', 30),
  ('Feed Store / Facilities', 'Lighting problem', 40),
  ('Feed Store / Facilities', 'Water leakage', 50),
  ('Feed Store / Facilities', 'Drainage problem', 60),
  -- Communication
  ('Communication', 'Radio problem', 10),
  ('Communication', 'CCTV problem', 20),
  ('Communication', 'Internet / network problem', 30),
  ('Communication', 'Communication equipment problem', 40),
  -- Plumbing (general)
  ('Plumbing', 'Pipe leakage', 10),
  ('Plumbing', 'Pipe blockage', 20),
  ('Plumbing', 'Valve problem', 30),
  ('Plumbing', 'Fixture damage', 40),
  ('Plumbing', 'Drainage problem', 50),
  -- Civil / Building (general)
  ('Civil / Building', 'Wall damage', 10),
  ('Civil / Building', 'Floor damage', 20),
  ('Civil / Building', 'Roof problem', 30),
  ('Civil / Building', 'Door / window problem', 40),
  ('Civil / Building', 'Structural crack', 50),
  -- HVAC (general)
  ('HVAC', 'Air conditioning problem', 10),
  ('HVAC', 'Ventilation problem', 20),
  ('HVAC', 'Temperature control problem', 30),
  ('HVAC', 'Duct problem', 40),
  -- Generator (general)
  ('Generator', 'Generator failure', 10),
  ('Generator', 'Fuel problem', 20),
  ('Generator', 'Starter problem', 30),
  ('Generator', 'Battery problem', 40),
  ('Generator', 'Overheating', 50),
  -- Pumps (general)
  ('Pumps', 'Pump failure', 10),
  ('Pumps', 'Pump vibration', 20),
  ('Pumps', 'Low output', 30),
  ('Pumps', 'Seal leakage', 40),
  ('Pumps', 'Motor problem', 50),
  -- Vehicles
  ('Vehicles', 'Engine problem', 10),
  ('Vehicles', 'Battery problem', 20),
  ('Vehicles', 'Tyre problem', 30),
  ('Vehicles', 'Brake problem', 40),
  ('Vehicles', 'Electrical problem', 50),
  -- Safety
  ('Safety', 'Fire extinguisher issue', 10),
  ('Safety', 'Safety signage issue', 20),
  ('Safety', 'PPE shortage', 30),
  ('Safety', 'Emergency equipment fault', 40),
  ('Safety', 'Alarm system problem', 50),
  -- IT / Network
  ('IT / Network', 'Network outage', 10),
  ('IT / Network', 'Wi-Fi problem', 20),
  ('IT / Network', 'Computer hardware fault', 30),
  ('IT / Network', 'Software issue', 40),
  ('IT / Network', 'CCTV / network camera problem', 50),
  -- Equipment (general)
  ('Equipment', 'General equipment failure', 10),
  ('Equipment', 'Equipment calibration required', 20),
  ('Equipment', 'Equipment breakdown', 30),
  ('Equipment', 'Equipment noise / vibration', 40),
  -- Structural
  ('Structural', 'Structural crack', 10),
  ('Structural', 'Corrosion', 20),
  ('Structural', 'Foundation issue', 30),
  ('Structural', 'Support damage', 40),
  -- Welding
  ('Welding', 'Weld repair required', 10),
  ('Welding', 'Metal fabrication needed', 20),
  ('Welding', 'Frame damage', 30),
  ('Welding', 'Structural weld failure', 40),
  -- Fabrication
  ('Fabrication', 'Custom part required', 10),
  ('Fabrication', 'Fabrication repair', 20),
  ('Fabrication', 'Material replacement', 30),
  -- Preventive Maintenance
  ('Preventive Maintenance', 'Scheduled inspection', 10),
  ('Preventive Maintenance', 'Scheduled service', 20),
  ('Preventive Maintenance', 'Routine calibration', 30),
  ('Preventive Maintenance', 'Routine lubrication', 40),
  -- Other
  ('Other', 'Other / miscellaneous problem', 10),
  ('Other', 'Unspecified issue', 20)
)
insert into maintenance_problem_types (category_id, name, sort_order)
select c.id, pt.name, pt.sort_order
from pt
join maintenance_categories c on c.name = pt.category_name
on conflict (category_id, name) do nothing;

-- ============================================================================
-- Status transition graph (source of truth enforced by functions.sql trigger)
-- ============================================================================

insert into request_status_transitions (from_status, to_status, allowed_roles) values
  ('SUBMITTED', 'RECEIVED', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),
  ('SUBMITTED', 'REJECTED', array['ENGINEERING_MANAGER']::user_role[]),
  ('SUBMITTED', 'CANCELLED', array['STATION_USER']::user_role[]),

  ('RECEIVED', 'ACKNOWLEDGED', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),
  ('RECEIVED', 'REJECTED', array['ENGINEERING_MANAGER']::user_role[]),
  ('RECEIVED', 'CANCELLED', array['STATION_USER']::user_role[]),

  ('ACKNOWLEDGED', 'ASSIGNED', array['ENGINEERING_MANAGER']::user_role[]),
  ('ACKNOWLEDGED', 'REJECTED', array['ENGINEERING_MANAGER']::user_role[]),
  ('ACKNOWLEDGED', 'CANCELLED', array['STATION_USER']::user_role[]),

  ('ASSIGNED', 'SCHEDULED', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),
  ('ASSIGNED', 'IN_PROGRESS', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),

  ('SCHEDULED', 'IN_PROGRESS', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),

  ('IN_PROGRESS', 'WAITING_FOR_PARTS', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),
  ('IN_PROGRESS', 'WAITING_FOR_EXTERNAL_SUPPORT', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),
  ('IN_PROGRESS', 'ON_HOLD', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),
  ('IN_PROGRESS', 'COMPLETED', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),

  ('WAITING_FOR_PARTS', 'IN_PROGRESS', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),
  ('WAITING_FOR_EXTERNAL_SUPPORT', 'IN_PROGRESS', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),
  ('ON_HOLD', 'IN_PROGRESS', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),

  ('COMPLETED', 'PENDING_CONFIRMATION', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),

  ('PENDING_CONFIRMATION', 'CLOSED', array['STATION_USER']::user_role[]),
  ('PENDING_CONFIRMATION', 'REOPENED', array['STATION_USER']::user_role[]),

  ('REOPENED', 'ACKNOWLEDGED', array['ENGINEERING_MANAGER']::user_role[]),
  ('REOPENED', 'ASSIGNED', array['ENGINEERING_MANAGER']::user_role[]),
  ('REOPENED', 'IN_PROGRESS', array['ENGINEERING_MANAGER','ENGINEER']::user_role[]),

  ('CLOSED', 'REOPENED', array['ADMIN']::user_role[])
on conflict (from_status, to_status) do nothing;
