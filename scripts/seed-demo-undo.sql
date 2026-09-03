-- Removes everything created by scripts/seed-demo.sql.
--
--   psql "$DATABASE_URL" -f scripts/seed-demo-undo.sql
--
-- Buddha Park is returned to DRAFT. Images cascade with their attraction.

BEGIN;

DELETE FROM attraction_image WHERE public_id LIKE 'demo/%';

DELETE FROM attraction
WHERE slug IN (
    'vizag-kailasagiri',
    'vizag-submarine-museum',
    'vizag-rushikonda-beach',
    'araku-borra-caves',
    'araku-katiki-waterfalls',
    'araku-coffee-plantations',
    'araku-tribal-museum',
    'vijayawada-kanaka-durga-temple',
    'vijayawada-prakasam-barrage',
    'vijayawada-undavalli-caves',
    'tirupati-tirumala-temple',
    'tirupati-sv-zoological-park',
    'hyderabad-charminar',
    'hyderabad-laad-bazaar',
    'hyderabad-ntr-gardens'
);

DELETE FROM city
WHERE code IN ('VIZAG', 'ARAKU', 'VJA', 'TPT', 'HYD')
  AND NOT EXISTS (SELECT 1 FROM attraction WHERE attraction.city_id = city.id);

UPDATE attraction
SET status = 'DRAFT', updated_at = now()
WHERE slug = 'eluru-buddha-park';

COMMIT;
