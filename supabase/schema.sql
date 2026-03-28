-- Hospi-Track bed board — run in Supabase SQL Editor, then enable Realtime on both tables
-- (Dashboard → Database → Replication, or use statements below if your project supports them).

create extension if not exists "pgcrypto";

create table if not exists public.beds (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status text not null check (status in ('available', 'occupied', 'cleaning', 'reserved')),
  status_note text,
  updated_at timestamptz default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  bed_id uuid references public.beds (id) on delete cascade,
  full_name text not null,
  patient_code text,
  gender text check (gender is null or gender in ('male', 'female', 'other')),
  admission_date date,
  condition_category text,
  doctor_name text,
  unique (bed_id)
);

create index if not exists patients_bed_id_idx on public.patients (bed_id);

alter table public.beds enable row level security;
alter table public.patients enable row level security;

-- Demo: open access for anon (tighten for production)
create policy "beds_all_anon" on public.beds for all using (true) with check (true);
create policy "patients_all_anon" on public.patients for all using (true) with check (true);

-- Optional seed (edit codes as needed)
insert into public.beds (code, status)
values
  ('A-01', 'available'),
  ('A-02', 'occupied'),
  ('A-03', 'cleaning'),
  ('A-04', 'reserved')
on conflict (code) do nothing;

-- Realtime (Supabase UI: add `beds` and `patients` to the `supabase_realtime` publication)
-- alter publication supabase_realtime add table public.beds;
-- alter publication supabase_realtime add table public.patients;

-- Patient flow (Admissions page)
alter table public.patients
  add column if not exists discharge_status text default 'none'
    check (discharge_status is null or discharge_status in ('none', 'discharge_ordered', 'discharged'));
alter table public.patients
  add column if not exists expected_discharge timestamptz;
alter table public.patients
  add column if not exists actual_discharge timestamptz;
alter table public.patients
  add column if not exists discharge_ordered_at timestamptz;

create table if not exists public.admissions_queue (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  arrival_type text not null check (arrival_type in ('emergency', 'normal')),
  status text not null default 'pending' check (status in ('pending', 'arrived', 'cancelled')),
  source text not null default 'emergency' check (source in ('elective', 'emergency', 'walk_in')),
  expected_arrival timestamptz not null,
  assigned_bed_id uuid references public.beds (id),
  created_at timestamptz default now()
);

alter table public.admissions_queue enable row level security;
create policy "admissions_queue_all_anon" on public.admissions_queue for all using (true) with check (true);

-- alter publication supabase_realtime add table public.admissions_queue;
