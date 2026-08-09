-- QueueLive: lightweight 👍/👎 confirmation on a report, so other visitors
-- can flag "this changed" without waiting for it to time out. Feeds
-- Confidence in lib/aggregateStatus.ts — a report with more 👎 than 👍
-- drops confidence one step even while still fresh by age.

create table report_confirmations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references queue_reports(id) on delete cascade,
  device_id text not null,
  vote boolean not null,
  created_at timestamptz not null default now(),
  constraint report_confirmations_one_vote_per_device unique (report_id, device_id)
);

create index idx_report_confirmations_report on report_confirmations(report_id);

alter table report_confirmations enable row level security;

create policy "public read report_confirmations"
  on report_confirmations for select
  using (true);

create policy "public insert report_confirmations"
  on report_confirmations for insert
  with check (true);

alter publication supabase_realtime add table report_confirmations;
