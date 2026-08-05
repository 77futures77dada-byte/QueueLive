-- QueueLive: address + phone for the popup's "Проложить маршрут" / tel: link.
-- Both nullable — phone stays empty until a verified number is on hand
-- (no invented numbers), and the UI already handles either being absent.

alter table locations add column address text;
alter table locations add column phone text;

-- Addresses confirmed earlier for the 4 seeded EMOs; matched by name so
-- this is safe to run whether or not 0002's seed has already run.
update locations set address = 'Ravi 18, Tallinn' where name = 'Ida-Tallinna Keskhaigla — EMO';
update locations set address = 'J. Sütiste tee 19, Tallinn' where name = 'Põhja-Eesti Regionaalhaigla (PERH) — EMO';
update locations set address = 'Paldiski mnt 68, Tallinn' where name = 'Lääne-Tallinna Keskhaigla — EMO';
update locations set address = 'Tervise 28, Tallinn' where name = 'Tallinna Lastehaigla — EMO (kuni 18-aastastele)';
