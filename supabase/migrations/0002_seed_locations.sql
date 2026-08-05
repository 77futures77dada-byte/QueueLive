-- QueueLive: seed locations — Tallinn emergency departments (EMO) only.
-- Coordinates verified: Ida-Tallinna Keskhaigla given directly; the other
-- three geocoded via Nominatim (OpenStreetMap) and cross-checked against
-- the returned place name.

insert into locations (name, type, lat, lng, city) values
  ('Ida-Tallinna Keskhaigla — EMO', 'hospital', 59.4270472, 24.7556639, 'Tallinn'),
  ('Põhja-Eesti Regionaalhaigla (PERH) — EMO', 'hospital', 59.3984900, 24.7015107, 'Tallinn'),
  ('Lääne-Tallinna Keskhaigla — EMO', 'hospital', 59.4307428, 24.6919194, 'Tallinn'),
  ('Tallinna Lastehaigla — EMO (kuni 18-aastastele)', 'hospital', 59.3971935, 24.7033351, 'Tallinn');
