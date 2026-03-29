-- ============================================================
-- HOSPI-TRACK — COMPLETE SCHEMA + SEED
-- Run this in one shot in Supabase SQL Editor (fresh project, zero tables)
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. WARDS
-- ============================================================
create table if not exists public.wards (
  id          uuid primary key default gen_random_uuid(),
  name        text    not null unique,
  total_beds  int     not null default 0,
  alerts      int     not null default 0,
  is_critical boolean not null default false,
  created_at  timestamptz default now()
);
alter table public.wards enable row level security;
create policy "wards_all_anon" on public.wards for all using (true) with check (true);

-- ============================================================
-- 2. BEDS
-- ============================================================
create table if not exists public.beds (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  status      text not null check (status in ('available','occupied','cleaning','reserved')),
  status_note text,
  ward_id     uuid references public.wards(id) on delete set null,
  updated_at  timestamptz default now()
);
alter table public.beds enable row level security;
create policy "beds_all_anon" on public.beds for all using (true) with check (true);

-- ============================================================
-- 3. PATIENTS
-- ============================================================
create table if not exists public.patients (
  id                   uuid primary key default gen_random_uuid(),
  bed_id               uuid unique references public.beds(id) on delete cascade,
  full_name            text not null,
  patient_code         text,
  gender               text check (gender is null or gender in ('male','female','other')),
  admission_date       date,
  condition_category   text,
  doctor_name          text,
  discharge_status     text default 'none'
    check (discharge_status is null or discharge_status in ('none','discharge_ordered','discharged')),
  expected_discharge   timestamptz,
  actual_discharge     timestamptz,
  discharge_ordered_at timestamptz
);
create index if not exists patients_bed_id_idx on public.patients(bed_id);
alter table public.patients enable row level security;
create policy "patients_all_anon" on public.patients for all using (true) with check (true);

-- ============================================================
-- 4. ADMISSIONS QUEUE
-- ============================================================
create table if not exists public.admissions_queue (
  id               uuid primary key default gen_random_uuid(),
  patient_name     text not null,
  arrival_type     text not null check (arrival_type in ('emergency','normal')),
  status           text not null default 'pending'
    check (status in ('pending','arrived','cancelled')),
  source           text not null default 'emergency'
    check (source in ('elective','emergency','walk_in')),
  expected_arrival timestamptz not null,
  assigned_bed_id  uuid references public.beds(id),
  created_at       timestamptz default now()
);
alter table public.admissions_queue enable row level security;
create policy "admissions_queue_all_anon" on public.admissions_queue for all using (true) with check (true);

-- ============================================================
-- 5. EQUIPMENT ITEMS  (Inventory)
-- ============================================================
create table if not exists public.equipment_items (
  id                  uuid primary key default gen_random_uuid(),
  sku                 text not null unique,
  name                text not null,
  category            text not null,
  ward                text not null,
  total               int  not null default 0,
  available           int  not null default 0,
  in_use              int  not null default 0,
  reserved            int  not null default 0,
  low_stock_threshold int  not null default 5,
  last_audit          date,
  daily_use_avg       float not null default 0,
  updated_at          timestamptz default now()
);
alter table public.equipment_items enable row level security;
create policy "equipment_items_all_anon" on public.equipment_items for all using (true) with check (true);

-- ============================================================
-- 6. DISEASE CLUSTERS  (Outbreak cluster table)
-- ============================================================
create table if not exists public.disease_clusters (
  id          uuid primary key default gen_random_uuid(),
  disease     text not null,
  cases       int  not null default 0,
  time_window text not null,
  ward        text not null,
  risk        text not null check (risk in ('safe','warning','critical')),
  recorded_at timestamptz default now()
);
alter table public.disease_clusters enable row level security;
create policy "disease_clusters_all_anon" on public.disease_clusters for all using (true) with check (true);

-- ============================================================
-- 7. DISEASE CASES  (Outbreak time-series chart)
-- ============================================================
create table if not exists public.disease_cases (
  id          uuid primary key default gen_random_uuid(),
  disease     text not null,
  ward        text not null,
  recorded_at timestamptz not null default now(),
  case_count  int  not null default 1
);
alter table public.disease_cases enable row level security;
create policy "disease_cases_all_anon" on public.disease_cases for all using (true) with check (true);

-- ============================================================
-- 8. AUTHORITY CONTACTS  (Outbreak notification panel)
-- ============================================================
create table if not exists public.authority_contacts (
  id         text primary key,
  short_name text not null,
  full_name  text not null,
  role       text not null,
  channel    text not null,
  status     text not null default 'ready' check (status in ('ready','sent'))
);
alter table public.authority_contacts enable row level security;
create policy "authority_contacts_all_anon" on public.authority_contacts for all using (true) with check (true);

-- ============================================================
-- ENABLE REALTIME ON ALL TABLES
-- ============================================================
alter publication supabase_realtime add table public.wards;
alter publication supabase_realtime add table public.beds;
alter publication supabase_realtime add table public.patients;
alter publication supabase_realtime add table public.admissions_queue;
alter publication supabase_realtime add table public.equipment_items;
alter publication supabase_realtime add table public.disease_clusters;
alter publication supabase_realtime add table public.disease_cases;
alter publication supabase_realtime add table public.authority_contacts;

-- ============================================================
-- SEED DATA — WARDS
-- ============================================================
insert into public.wards (id, name, total_beds, alerts, is_critical) values
  ('11111111-0000-0000-0000-000000000001', 'Ward A — General',   40, 3, false),
  ('11111111-0000-0000-0000-000000000002', 'Ward B — Post-op',   25, 5, true),
  ('11111111-0000-0000-0000-000000000003', 'Ward C — Emergency', 30, 0, false),
  ('11111111-0000-0000-0000-000000000004', 'Ward D — ICU',       12, 2, false),
  ('11111111-0000-0000-0000-000000000005', 'Ward E — Pediatric', 20, 0, false),
  ('11111111-0000-0000-0000-000000000006', 'Ward F — Maternity', 15, 1, false)
on conflict (name) do nothing;

-- ============================================================
-- SEED DATA — BEDS
-- ============================================================
insert into public.beds (code, status, ward_id) values
  ('A-01', 'occupied',  '11111111-0000-0000-0000-000000000001'),
  ('A-02', 'occupied',  '11111111-0000-0000-0000-000000000001'),
  ('A-03', 'occupied',  '11111111-0000-0000-0000-000000000001'),
  ('A-04', 'reserved',  '11111111-0000-0000-0000-000000000001'),
  ('A-05', 'cleaning',  '11111111-0000-0000-0000-000000000001'),
  ('A-06', 'available', '11111111-0000-0000-0000-000000000001'),
  ('A-07', 'available', '11111111-0000-0000-0000-000000000001'),
  ('B-01', 'available', '11111111-0000-0000-0000-000000000002'),
  ('B-02', 'cleaning',  '11111111-0000-0000-0000-000000000002'),
  ('B-03', 'occupied',  '11111111-0000-0000-0000-000000000002'),
  ('B-04', 'reserved',  '11111111-0000-0000-0000-000000000002'),
  ('B-05', 'available', '11111111-0000-0000-0000-000000000002'),
  ('C-01', 'occupied',  '11111111-0000-0000-0000-000000000003'),
  ('C-02', 'occupied',  '11111111-0000-0000-0000-000000000003'),
  ('C-03', 'available', '11111111-0000-0000-0000-000000000003'),
  ('D-01', 'occupied',  '11111111-0000-0000-0000-000000000004'),
  ('D-02', 'occupied',  '11111111-0000-0000-0000-000000000004'),
  ('D-03', 'cleaning',  '11111111-0000-0000-0000-000000000004'),
  ('E-01', 'available', '11111111-0000-0000-0000-000000000005'),
  ('E-02', 'available', '11111111-0000-0000-0000-000000000005'),
  ('F-01', 'occupied',  '11111111-0000-0000-0000-000000000006'),
  ('F-02', 'available', '11111111-0000-0000-0000-000000000006')
on conflict (code) do nothing;

-- ============================================================
-- SEED DATA — PATIENTS (real Indian names)
-- ============================================================
insert into public.patients (bed_id, full_name, patient_code, gender, admission_date, condition_category, doctor_name, discharge_status, expected_discharge, discharge_ordered_at)
select b.id, 'Ramesh Kumar', 'P1001', 'male', '2026-03-22', 'Cardiac care', 'Dr. A. Patel',
  'discharge_ordered', now() + interval '45 minutes', now() - interval '3 hours'
from public.beds b where b.code = 'A-01' on conflict (bed_id) do nothing;

insert into public.patients (bed_id, full_name, patient_code, gender, admission_date, condition_category, doctor_name, discharge_status, expected_discharge, discharge_ordered_at)
select b.id, 'Priya Nair', 'P1002', 'female', '2026-03-23', 'Pneumonia', 'Dr. M. Chen',
  'discharge_ordered', now() + interval '2 hours', now() - interval '40 minutes'
from public.beds b where b.code = 'A-02' on conflict (bed_id) do nothing;

insert into public.patients (bed_id, full_name, patient_code, gender, admission_date, condition_category, doctor_name, discharge_status)
select b.id, 'Sanjay Verma', 'P1003', 'male', '2026-03-24', 'Post-operative', 'Dr. L. Okonkwo', 'none'
from public.beds b where b.code = 'A-03' on conflict (bed_id) do nothing;

insert into public.patients (bed_id, full_name, patient_code, gender, admission_date, condition_category, doctor_name, discharge_status)
select b.id, 'Riley Morgan', 'P1004', 'female', '2026-03-24', 'Pulmonology', 'Dr. K. Singh', 'none'
from public.beds b where b.code = 'B-03' on conflict (bed_id) do nothing;

insert into public.patients (bed_id, full_name, patient_code, gender, admission_date, condition_category, doctor_name, discharge_status)
select b.id, 'Arun Sharma', 'P1005', 'male', '2026-03-25', 'Orthopaedics', 'Dr. P. Gupta', 'none'
from public.beds b where b.code = 'C-01' on conflict (bed_id) do nothing;

insert into public.patients (bed_id, full_name, patient_code, gender, admission_date, condition_category, doctor_name, discharge_status)
select b.id, 'Deepa Iyer', 'P1006', 'female', '2026-03-26', 'Neurology', 'Dr. R. Shah', 'none'
from public.beds b where b.code = 'C-02' on conflict (bed_id) do nothing;

insert into public.patients (bed_id, full_name, patient_code, gender, admission_date, condition_category, doctor_name, discharge_status)
select b.id, 'Mohan Yadav', 'P1007', 'male', '2026-03-27', 'ICU - Sepsis', 'Dr. V. Pillai', 'none'
from public.beds b where b.code = 'D-01' on conflict (bed_id) do nothing;

insert into public.patients (bed_id, full_name, patient_code, gender, admission_date, condition_category, doctor_name, discharge_status)
select b.id, 'Lakshmi Reddy', 'P1008', 'female', '2026-03-27', 'ICU - Cardiac', 'Dr. A. Patel', 'none'
from public.beds b where b.code = 'D-02' on conflict (bed_id) do nothing;

insert into public.patients (bed_id, full_name, patient_code, gender, admission_date, condition_category, doctor_name, discharge_status)
select b.id, 'Sushmita Roy', 'P1009', 'female', '2026-03-28', 'Post-natal care', 'Dr. N. Joshi', 'none'
from public.beds b where b.code = 'F-01' on conflict (bed_id) do nothing;

-- Waiting patient (no bed assigned)
insert into public.patients (full_name, patient_code, gender, condition_category, doctor_name, discharge_status)
values ('Kiran Bose', 'P1012', 'other', 'Observation - no bed yet', 'Dr. S. Rao', 'none');

-- ============================================================
-- SEED DATA — ADMISSIONS QUEUE
-- ============================================================
insert into public.admissions_queue (patient_name, arrival_type, status, source, expected_arrival) values
  ('Meera Shah',   'emergency', 'pending', 'emergency', now() - interval '15 minutes'),
  ('Arjun Mehta',  'normal',    'pending', 'walk_in',   now() + interval '10 minutes'),
  ('Neha Kapoor',  'emergency', 'pending', 'emergency', now() + interval '28 minutes'),
  ('Kavita Rao',   'normal',    'pending', 'elective',  now() + interval '26 hours'),
  ('Daniel Ortiz', 'normal',    'pending', 'elective',  now() + interval '50 hours');

-- ============================================================
-- SEED DATA — EQUIPMENT ITEMS (Inventory)
-- ============================================================
insert into public.equipment_items (sku, name, category, ward, total, available, in_use, reserved, low_stock_threshold, last_audit, daily_use_avg) values
  ('EQ-ICU-VNT-01', 'Ventilator - ICU Pro',              'ICU',       'Ward C',        24,  6, 14,  4,  5, '2026-03-27', 3.2),
  ('EQ-ICU-MON-02', 'Patient Monitor - Multi-parameter',  'ICU',       'Ward C',        48, 22, 20,  6,  8, '2026-03-28', 5.1),
  ('EQ-GEN-INF-03', 'Infusion Pump',                      'General',   'Ward A',       120, 45, 62, 13, 15, '2026-03-28', 12.0),
  ('EQ-ER-US-04',   'Portable Ultrasound',                'Emergency', 'Ward B',         8,  2,  4,  2,  2, '2026-03-26', 1.1),
  ('EQ-ER-AED-05',  'Defibrillator / AED',                'Emergency', 'Ward B',        16,  9,  5,  2,  3, '2026-03-28', 2.4),
  ('EQ-OR-ORT-06',  'Surgical Instrument Set - Ortho',    'General',   'OR Suite',      32, 14, 12,  6,  6, '2026-03-25', 4.0),
  ('EQ-GEN-WC-07',  'Wheelchair - Transport',             'General',   'Central Store', 55, 28, 18,  9, 10, '2026-03-28', 8.0),
  ('EQ-ICU-ECM-08', 'ECMO Circuit Kit',                   'ICU',       'Ward C',         6,  1,  4,  1,  2, '2026-03-27', 0.4),
  ('EQ-ER-CRT-09',  'Crash Cart - Standard',              'Emergency', 'Ward B',        10,  4,  4,  2,  2, '2026-03-28', 1.8),
  ('EQ-GEN-NEB-10', 'Nebulizer',                          'General',   'Ward A',        40, 18, 17,  5,  8, '2026-03-28', 6.0),
  ('EQ-GEN-BP-11',  'Blood Pressure Cuff Set',            'General',   'Central Store',200, 95, 85, 20, 25, '2026-03-28', 22.0),
  ('EQ-ICU-SUC-12', 'Suction Unit - Wall',                'ICU',       'Ward C',        36,  8, 22,  6,  8, '2026-03-27', 3.5)
on conflict (sku) do nothing;

-- ============================================================
-- SEED DATA — DISEASE CLUSTERS (Outbreak cluster table)
-- ============================================================
insert into public.disease_clusters (disease, cases, time_window, ward, risk) values
  ('Typhoid',  12, 'Last 6h',  'Ward A',    'critical'),
  ('Typhoid',   4, 'Last 12h', 'Ward B',    'warning'),
  ('Dengue',    6, 'Last 6h',  'Emergency', 'warning'),
  ('Influenza', 8, 'Last 24h', 'Ward A',    'safe');

-- ============================================================
-- SEED DATA — DISEASE CASES (time-series chart, last 7 hours)
-- ============================================================
insert into public.disease_cases (disease, ward, recorded_at, case_count) values
  ('Typhoid',   'Ward A',    now() - interval '6 hours',  2),
  ('Typhoid',   'Ward A',    now() - interval '5 hours',  3),
  ('Typhoid',   'Ward A',    now() - interval '4 hours',  4),
  ('Typhoid',   'Ward A',    now() - interval '3 hours',  5),
  ('Typhoid',   'Ward A',    now() - interval '2 hours',  7),
  ('Typhoid',   'Ward A',    now() - interval '1 hour',   9),
  ('Typhoid',   'Ward A',    now(),                       12),
  ('Dengue',    'Emergency', now() - interval '6 hours',  5),
  ('Dengue',    'Emergency', now() - interval '5 hours',  5),
  ('Dengue',    'Emergency', now() - interval '4 hours',  6),
  ('Dengue',    'Emergency', now() - interval '3 hours',  5),
  ('Dengue',    'Emergency', now() - interval '2 hours',  6),
  ('Dengue',    'Emergency', now() - interval '1 hour',   6),
  ('Dengue',    'Emergency', now(),                        5),
  ('Influenza', 'Ward A',    now() - interval '6 hours',  3),
  ('Influenza', 'Ward A',    now() - interval '5 hours',  3),
  ('Influenza', 'Ward A',    now() - interval '4 hours',  4),
  ('Influenza', 'Ward A',    now() - interval '3 hours',  4),
  ('Influenza', 'Ward A',    now() - interval '2 hours',  4),
  ('Influenza', 'Ward A',    now() - interval '1 hour',   5),
  ('Influenza', 'Ward A',    now(),                        4);

-- ============================================================
-- SEED DATA — AUTHORITY CONTACTS
-- ============================================================
insert into public.authority_contacts (id, short_name, full_name, role, channel, status) values
  ('bmc',   'BMC',         'Brihanmumbai Municipal Corporation',           'Municipal health authority & epidemic response',         'Secure API · Email · SMS fallback', 'ready'),
  ('fssai', 'FSSAI',       'Food Safety and Standards Authority of India', 'Food-borne illness surveillance linkage',                 'Regulatory reporting API',          'ready'),
  ('local', 'District PHO','Local Health Department',                      'District public health officer network',                 'Encrypted email · Direct line',     'ready'),
  ('who',   'WHO',         'World Health Organization',                    'International health regulations (optional escalation)', 'IHR secure channel',                'ready')
on conflict (id) do nothing;
