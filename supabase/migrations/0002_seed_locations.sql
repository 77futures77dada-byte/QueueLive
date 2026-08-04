-- QueueLive: seed locations for Tallinn (MVP placeholder data)
-- Coordinates are approximate (institution-level, not entrance-precise).
-- Verify/correct against real addresses before relying on the 200m geo-check in production.

insert into locations (name, type, lat, lng, city) values
  -- Hospitals / erakorralise meditsiini osakonnad (trauma & emergency)
  ('Ida-Tallinna Keskhaigla — Erakorralise meditsiini osakond', 'hospital', 59.4372, 24.7455, 'Tallinn'),
  ('Põhja-Eesti Regionaalhaigla — EMO', 'hospital', 59.4066, 24.6672, 'Tallinn'),
  ('Tallinna Lastehaigla — EMO', 'hospital', 59.4268, 24.7185, 'Tallinn'),
  ('Ida-Tallinna Keskhaigla — Magdaleena kliinik', 'hospital', 59.4374, 24.7391, 'Tallinn'),
  ('Ida-Tallinna Keskhaigla — Sünnitusmaja', 'hospital', 59.4423, 24.7147, 'Tallinn'),

  -- Perearstikeskused / kliinikud (clinics / policlinics)
  ('Mustamäe Perearstikeskus', 'clinic', 59.4048, 24.6748, 'Tallinn'),
  ('Kristiine Perearstikeskus', 'clinic', 59.4262, 24.7062, 'Tallinn'),
  ('Lasnamäe Perearstikeskus', 'clinic', 59.4341, 24.7965, 'Tallinn'),
  ('Kesklinna Perearstikeskus', 'clinic', 59.4340, 24.7500, 'Tallinn'),
  ('Confido Kliinik', 'clinic', 59.4082, 24.7071, 'Tallinn'),
  ('Qvalitas Arstikeskus', 'clinic', 59.4290, 24.7107, 'Tallinn'),
  ('Järveotsa Perearstikeskus', 'clinic', 59.4130, 24.6410, 'Tallinn'),
  ('Pirita Perearstikeskus', 'clinic', 59.4645, 24.8121, 'Tallinn'),
  ('Nõmme Perearstikeskus', 'clinic', 59.3819, 24.6612, 'Tallinn'),

  -- Teenindussaalid (MFC-analog: gov. service halls)
  ('PPA Pärnu mnt teenindussaal', 'mfc', 59.4152, 24.7311, 'Tallinn'),
  ('Sotsiaalkindlustusamet — Tallinna klienditeenindus', 'mfc', 59.4297, 24.6975, 'Tallinn'),
  ('Töötukassa — Tallinna osakond', 'mfc', 59.4258, 24.7040, 'Tallinn'),
  ('Maksu- ja Tolliamet — Tallinna teenindussaal', 'mfc', 59.3934, 24.6699, 'Tallinn'),

  -- Postkontorid
  ('Omniva Postkontor — Narva mnt', 'post', 59.4374, 24.7581, 'Tallinn'),
  ('Omniva Postkontor — Mustamäe', 'post', 59.4200, 24.6890, 'Tallinn');
