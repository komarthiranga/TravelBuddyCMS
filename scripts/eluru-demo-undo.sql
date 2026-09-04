-- Removes everything scripts/eluru-demo.sql added.
--
--   psql "$DATABASE_URL" -f scripts/eluru-demo-undo.sql
--
-- Buddha Park is your own record and is left published; only its travel_modes
-- go back to what they were.

BEGIN;

DELETE FROM attraction
WHERE slug IN (
    'eluru-dwaraka-tirumala',
    'eluru-kolleru-lake',
    'eluru-guntupalli-caves',
    'eluru-powerpet-market',
    'eluru-sample-tiffin-house',
    'eluru-sample-lodge'
);

-- Only drop the new categories if nothing else is using them.
DELETE FROM category
WHERE code IN ('RESTAURANT', 'HOTEL')
  AND NOT EXISTS (SELECT 1 FROM attraction WHERE attraction.category_id = category.id);

UPDATE attraction
SET travel_modes = ARRAY['Auto', 'Bus', 'Car'], updated_at = now()
WHERE slug = 'eluru-buddha-park';

COMMIT;
