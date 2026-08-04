-- QueueLive: core schema for locations and queue reports

create extension if not exists "pgcrypto";

create type location_type as enum ('hospital', 'clinic', 'mfc', 'post');
create type load_level as enum ('low', 'medium', 'high');

create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type location_type not null,
  lat double precision not null,
  lng double precision not null,
  city text not null default 'Tallinn',
  created_at timestamptz not null default now()
);

create table queue_reports (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  load_level load_level not null,
  people_count int,
  device_id text not null,
  created_at timestamptz not null default now()
);

-- Backs both the client-side "last 30 min" aggregation query and rate-limit
-- lookups (latest report per device_id/location_id pair).
create index idx_queue_reports_location_created
  on queue_reports (location_id, created_at desc);

create index idx_queue_reports_device_location
  on queue_reports (device_id, location_id, created_at desc);

alter table locations enable row level security;
alter table queue_reports enable row level security;

create policy "public read locations"
  on locations for select
  using (true);

create policy "public read queue_reports"
  on queue_reports for select
  using (true);

create policy "public insert queue_reports"
  on queue_reports for insert
  with check (true);
