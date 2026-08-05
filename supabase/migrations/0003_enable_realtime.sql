-- Without this, the Supabase Realtime socket accepts the channel join but
-- rejects the postgres_changes subscription at the Postgres replication
-- layer ("Unable to subscribe to changes... Please check Realtime is
-- enabled"), so clients never receive INSERT events for queue_reports.
alter publication supabase_realtime add table queue_reports;
