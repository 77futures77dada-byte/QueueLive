-- QueueLive: per-department queue status within each hospital, instead of
-- one blended status for the whole location. Aggregation reuses the exact
-- same logic as locations (see lib/aggregateStatus.ts), just scoped to a
-- department's own reports.

create table departments (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now()
);

-- One department per slug per location — also lets the seed below use
-- `on conflict do nothing` so this migration is safe to re-run.
create unique index idx_departments_location_slug on departments(location_id, slug);

-- Nullable: a report without department_id still works as a location-wide
-- check-in (kept as an escape hatch), even though the current UI always
-- sets it now that reporting happens per department.
alter table queue_reports
  add column department_id uuid references departments(id) on delete set null;

create index idx_queue_reports_department_created
  on queue_reports (department_id, created_at desc);

alter table departments enable row level security;

create policy "public read departments"
  on departments for select
  using (true);

-- Base set of departments, identical across all 4 seeded EMOs — an MVP
-- simplification, not a claim about each hospital's real internal
-- structure.
insert into departments (location_id, name, slug)
select l.id, d.name, d.slug
from locations l
cross join (
  values
    ('Травма / переломы', 'trauma'),
    ('Терапевт / общее недомогание', 'general'),
    ('Хирург', 'surgery')
) as d(name, slug)
where l.type = 'hospital'
on conflict (location_id, slug) do nothing;
