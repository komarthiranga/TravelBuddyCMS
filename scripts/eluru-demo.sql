-- Demo content for the Eluru buddy journey.
--
--   psql "$DATABASE_URL" -f scripts/eluru-demo.sql
--   psql "$DATABASE_URL" -f scripts/eluru-demo-undo.sql   (to remove it all)
--
-- WHAT IS REAL AND WHAT IS NOT — please read before trusting this data:
--
--   * Dwaraka Tirumala, Kolleru Lake, Guntupalli caves and Powerpet are real
--     places in and around Eluru, and the descriptions are accurate.
--   * Their LATITUDE/LONGITUDE ARE APPROXIMATE. They are close enough for
--     "how far is it" to be roughly right, but verify each pin in the CMS
--     before anyone relies on them for directions.
--   * The restaurant and the lodge are PLACEHOLDERS. Their names start with
--     "Sample" on purpose — inventing details for a real business would be
--     worse than leaving a gap. Replace them with real ones in the CMS.
--
-- Safe to run twice: every insert is guarded on the slug.

BEGIN;

-- ── Categories for food and stays ───────────────────────────────────
INSERT INTO category (name, category_type, code)
SELECT 'Restaurant', 'Restaurant', 'RESTAURANT'
WHERE NOT EXISTS (SELECT 1 FROM category WHERE code = 'RESTAURANT');

INSERT INTO category (name, category_type, code)
SELECT 'Hotel', 'Stay', 'HOTEL'
WHERE NOT EXISTS (SELECT 1 FROM category WHERE code = 'HOTEL');

-- ── Places ──────────────────────────────────────────────────────────
INSERT INTO attraction (
    short_name, full_name, slug, address, city_id, category_id,
    latitude, longitude, entry_fee, currency_code,
    opening_time, closing_time, best_time_to_visit, travel_modes,
    short_description, full_description, instructions, status, is_active
)
SELECT
    v.short_name, v.full_name, v.slug, v.address,
    (SELECT id FROM city WHERE code = 'ELURU'),
    (SELECT id FROM category WHERE code = v.category_code),
    v.latitude, v.longitude, v.entry_fee, 'INR',
    v.opening_time, v.closing_time, v.best_time, v.travel_modes,
    v.short_description, v.full_description, v.instructions, 'PUBLISHED', true
FROM (
    VALUES
    (
        'Dwaraka Tirumala',
        'Sri Venkateswara Swamy Temple, Dwaraka Tirumala',
        'eluru-dwaraka-tirumala',
        'Dwaraka Tirumala, Eluru District, Andhra Pradesh, India',
        'RELIGIOUS_PLACE',
        16.949400, 81.322200,
        0.00,
        '04:00'::time, '21:00'::time,
        'Weekday mornings, before the queues build',
        ARRAY['Bus', 'Car'],
        'The temple everyone here calls Chinna Tirupati, about 42 km from Eluru.',
        E'People call this place Chinna Tirupati — little Tirupati — and they mean it as a compliment, not a comparison. The deity is swayambhu, meaning the idol was not carved and installed but found here, and that is why the temple matters so much to families in this district.\n\nThere are two idols worshipped in the same sanctum, and the priests will explain the difference if you ask politely. Most people from Eluru come here for a first haircut, a wedding blessing, or a promise kept.\n\nIt is a working temple rather than a monument, so it is busiest at dawn and on weekends. Go on a weekday morning and you will get an unhurried darshan.',
        E'Leave your footwear at the stands outside — do not carry them in.\nDress modestly; shoulders and knees covered is the safe rule.\nPhones and cameras are usually not allowed inside the sanctum.\nCarry small change for the queue and the prasadam counter.',
        'demo'
    ),
    (
        'Kolleru Lake',
        'Kolleru Lake and Atapaka Bird Sanctuary',
        'eluru-kolleru-lake',
        'Atapaka, Kolleru Lake, Eluru District, Andhra Pradesh, India',
        'LAKE_AND_DAM',
        16.616700, 81.216700,
        0.00,
        '06:00'::time, '18:00'::time,
        'November to February, at sunrise, for the migratory birds',
        ARRAY['Car', 'Bus'],
        'One of the largest freshwater lakes in India, sitting between the Krishna and Godavari deltas.',
        E'Kolleru is not a scenic lake in the postcard sense. It is a vast, shallow, working wetland between two river deltas, ringed by fish ponds and villages, and it is one of the largest freshwater lakes in the country.\n\nWhat brings people here are the birds. From about November the pelicans and painted storks arrive in thousands, and the Atapaka side of the lake is where you can actually see them without a boat. Early morning is the only time worth coming — by ten the light is flat and the birds have settled.\n\nBring binoculars if you have them. There is very little shade and almost nowhere to buy water, so come prepared rather than optimistic.',
        E'Sunrise is the whole point — plan to arrive before 7 am.\nCarry your own water and a hat; there are no shops at the viewing area.\nStay on the bunds and do not walk into the fish ponds, they are private.\nKeep your distance from nesting birds and never try to make them fly.',
        'demo'
    ),
    (
        'Guntupalli Caves',
        'Guntupalli Buddhist Caves (Jeelakarragudem)',
        'eluru-guntupalli-caves',
        'Guntupalli, near Kamavarapukota, Eluru District, Andhra Pradesh, India',
        'HISTORICAL_PLACE',
        16.886900, 81.143900,
        0.00,
        '09:00'::time, '17:00'::time,
        'Cooler months, mid-morning when the light reaches the rock',
        ARRAY['Car'],
        'Rock-cut Buddhist caves on a quiet hillside, roughly two thousand years old.',
        E'This is the one I take people to when they think there is nothing old around Eluru. Cut into a hillside near Kamavarapukota is a group of Buddhist caves — a circular chaitya hall with a stupa inside it, and rows of small cells where monks actually lived, dating to around the second century BCE.\n\nThe chaitya is the piece worth the drive. It is carved to imitate a wooden building, right down to the ribs of the roof, in solid rock. Standing inside it is very quiet.\n\nThere is no crowd, no ticket queue and usually no guide, which is both the charm and the problem — read a little before you come or you will walk past the best details.',
        E'The last stretch of road is rough; a car with some clearance helps.\nWear shoes with grip, the rock steps get slippery after rain.\nThere are no shops or toilets at the site, so plan around that.\nDo not scratch, chalk or climb on the carvings.',
        'demo'
    ),
    (
        'Powerpet Market',
        'Powerpet Market Street, Eluru',
        'eluru-powerpet-market',
        'Powerpet, Eluru, Andhra Pradesh, India',
        'MARKET',
        16.706000, 81.101000,
        0.00,
        '09:00'::time, '21:00'::time,
        'Early evening, once the heat drops',
        ARRAY['Walk', 'Cycle', 'Auto', 'Bus'],
        'The main shopping street in town — cloth, gold, steel vessels and everything in between.',
        E'If you want to see Eluru rather than visit it, spend an hour in Powerpet. This is the town''s main shopping stretch: cloth shops with the fabric stacked to the ceiling, gold showrooms, steel vessel shops, and hawkers along the pavement in the evening.\n\nEluru has been known for its wool carpet weaving for a long time, so if that interests you, ask in the cloth shops and someone will point you in the right direction.\n\nCome after five when it cools down and the whole street is lit. Bargaining is expected in the smaller shops and slightly rude in the big showrooms — you will pick up the difference quickly.',
        E'Evenings are crowded; keep your phone and wallet in a front pocket.\nBargain in the street stalls, but not in the branded showrooms.\nMost small shops prefer cash or UPI over cards.\nParking is difficult — an auto is easier than bringing a car in.',
        'demo'
    ),
    (
        'Sample Tiffin House',
        'Sample Tiffin House (placeholder entry)',
        'eluru-sample-tiffin-house',
        'Replace this with a real address, Eluru, Andhra Pradesh, India',
        'RESTAURANT',
        16.704500, 81.099000,
        0.00,
        '06:30'::time, '11:00'::time,
        'Breakfast, between 7 and 9',
        ARRAY['Walk', 'Cycle', 'Auto'],
        'Placeholder so you can see how eating places behave — replace it with a real one in the CMS.',
        E'This entry is a placeholder, not a recommendation. It exists so you can see how the buddy handles a food category alongside the sightseeing.\n\nWhen you add a real tiffin place, the useful things to write here are what to order, what time the good stuff runs out, and whether there is somewhere to sit.',
        E'Replace this entry with a real restaurant before showing the site to anyone.',
        'demo'
    ),
    (
        'Sample Lodge',
        'Sample Lodge (placeholder entry)',
        'eluru-sample-lodge',
        'Replace this with a real address, Eluru, Andhra Pradesh, India',
        'HOTEL',
        16.708000, 81.098000,
        1200.00,
        NULL::time, NULL::time,
        'Book ahead during festival weeks',
        ARRAY['Walk', 'Auto'],
        'Placeholder so you can see how stays behave — replace it with a real one in the CMS.',
        E'This entry is a placeholder, not a recommendation. It is here so the buddy has something to show when someone asks about a place to stay.\n\nFor a real listing, what actually helps a visitor is how far it is from the bus stand or station, whether the rooms are quiet, and whether the price includes breakfast.',
        E'Replace this entry with a real stay before showing the site to anyone.',
        'demo'
    )
) AS v (
    short_name, full_name, slug, address, category_code,
    latitude, longitude, entry_fee,
    opening_time, closing_time, best_time, travel_modes,
    short_description, full_description, instructions, marker
)
WHERE NOT EXISTS (SELECT 1 FROM attraction a WHERE a.slug = v.slug);

-- Buddha Park predates this script; just make sure it advertises walking too,
-- so the mode picker has something to offer close by.
UPDATE attraction
SET travel_modes = ARRAY['Walk', 'Cycle', 'Auto', 'Bus', 'Car'], updated_at = now()
WHERE slug = 'eluru-buddha-park';

COMMIT;
