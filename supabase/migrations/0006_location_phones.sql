-- QueueLive: phone numbers for the 4 seeded EMOs, plus postal codes on the
-- addresses 0005 already set. Verified against each hospital's own site
-- (see PR discussion for sources) except Lääne-Tallinna Keskhaigla, which
-- keeps the number supplied directly rather than the one found on
-- keskhaigla.ee — flagged, not silently overridden.

update locations
set address = 'Ravi 18, 10138 Tallinn', phone = '+372 620 7040'
where name = 'Ida-Tallinna Keskhaigla — EMO';

update locations
set address = 'J. Sütiste tee 19, 13419 Tallinn', phone = '+372 617 1300'
where name = 'Põhja-Eesti Regionaalhaigla (PERH) — EMO';

update locations
set address = 'Paldiski mnt 68, 10617 Tallinn', phone = '+372 650 7301'
where name = 'Lääne-Tallinna Keskhaigla — EMO';

update locations
set address = 'Tervise 28, 13419 Tallinn', phone = '+372 697 7146'
where name = 'Tallinna Lastehaigla — EMO (kuni 18-aastastele)';
