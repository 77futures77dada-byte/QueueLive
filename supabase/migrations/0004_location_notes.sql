-- QueueLive: minimal anonymous notes/photos attached to a location report.
-- No accounts, no likes/threads — a short text and/or one photo, same
-- device_id + rate-limit as queue_reports. `hidden` is unused by the app
-- today; it's here so a moderation pass later doesn't need a migration.

create table location_notes (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  text text check (char_length(text) <= 300),
  photo_url text,
  device_id text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  constraint location_notes_has_content check (text is not null or photo_url is not null)
);

create index idx_location_notes_location_created
  on location_notes (location_id, created_at desc);

alter table location_notes enable row level security;

create policy "public read visible location_notes"
  on location_notes for select
  using (hidden = false);

create policy "public insert location_notes"
  on location_notes for insert
  with check (true);

-- Realtime for the new table, same as 0003 did for queue_reports.
alter publication supabase_realtime add table location_notes;

-- Public bucket for the one-photo-per-note attachment: 5MB cap, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('location-photos', 'location-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "public read location-photos"
  on storage.objects for select
  using (bucket_id = 'location-photos');

create policy "public upload location-photos"
  on storage.objects for insert
  with check (bucket_id = 'location-photos');
