-- QueueLive: department names now come from lib/i18n (translated per
-- locale, looked up by slug) instead of the DB — see components/
-- DepartmentReportList.tsx. `general` didn't read as a stable machine
-- identifier once it needed to key a translation table; renaming it here
-- rather than editing 0007 after the fact, since that migration already
-- ran.

update departments set slug = 'internal-medicine' where slug = 'general';
