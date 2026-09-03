-- Demo content for the public site.
--
--   psql "$DATABASE_URL" -f scripts/seed-demo.sql
--
-- Safe to re-run: every insert is keyed on a unique column and skips duplicates.
-- Remove everything again with scripts/seed-demo-undo.sql.
--
-- Demo rows are identifiable by city.code IN (VIZAG, ARAKU, VJA, TPT, HYD)
-- and attraction_image.public_id LIKE 'demo/%'.

BEGIN;

-- ── Cities ──────────────────────────────────────────────────────────────────
INSERT INTO city (name, code, state, country, latitude, longitude, is_active)
VALUES
    ('Visakhapatnam', 'VIZAG', 'Andhra Pradesh', 'India', 17.686816, 83.218482, true),
    ('Araku Valley',  'ARAKU', 'Andhra Pradesh', 'India', 18.329700, 82.874500, true),
    ('Vijayawada',    'VJA',   'Andhra Pradesh', 'India', 16.506174, 80.648015, true),
    ('Tirupati',      'TPT',   'Andhra Pradesh', 'India', 13.628700, 79.419200, true),
    ('Hyderabad',     'HYD',   'Telangana',      'India', 17.385044, 78.486671, true)
ON CONFLICT (code) DO NOTHING;

-- ── Attractions ─────────────────────────────────────────────────────────────
INSERT INTO attraction (
    short_name, full_name, slug, address,
    city_id, category_id,
    latitude, longitude, entry_fee, currency_code,
    opening_time, closing_time, best_time_to_visit, travel_modes,
    short_description, full_description, instructions,
    status, is_active
)
SELECT
    v.short_name, v.full_name, v.slug, v.address,
    (SELECT id FROM city WHERE code = v.city_code),
    (SELECT id FROM category WHERE code = v.category_code),
    v.latitude, v.longitude, v.entry_fee, 'INR',
    v.opening_time, v.closing_time, v.best_time, v.travel_modes,
    v.short_description, v.full_description, v.instructions,
    'PUBLISHED', true
FROM (
    VALUES
    (
        'Kailasagiri', 'Kailasagiri Hill Park', 'vizag-kailasagiri',
        'Kailasagiri Hill, Beach Road, Visakhapatnam, Andhra Pradesh 530043',
        'VIZAG', 'PARK', 17.749100::numeric, 83.343600::numeric, 25.00::numeric,
        '09:00'::time, '20:00'::time, 'October to February, late afternoon',
        ARRAY['CAR','BUS','AUTO'],
        'A landscaped hilltop park overlooking the Bay of Bengal, reached by a ropeway that glides over the treetops.',
        E'Kailasagiri sits about 360 feet above the coastline, and the climb is half the appeal. The ropeway carries you over dense greenery before opening onto a plateau of manicured lawns, walking trails and a small toy train that loops the summit.\n\nThe giant white statues of Shiva and Parvati anchor the viewpoint, and on a clear evening you can trace the entire curve of the shoreline from Rushikonda down to the harbour. Sunset is comfortably the best hour to be here.',
        E'Buy ropeway tickets separately at the base station.\nWeekends get crowded after 4 PM — arrive earlier for parking.\nThere is a fair amount of walking on the summit, so wear comfortable shoes.',
        NULL
    ),
    (
        'Submarine Museum', 'INS Kurusura Submarine Museum', 'vizag-submarine-museum',
        'Beach Road, Ramakrishna Beach, Visakhapatnam, Andhra Pradesh 530023',
        'VIZAG', 'MUSEUM', 17.717800::numeric, 83.323600::numeric, 75.00::numeric,
        '14:00'::time, '20:30'::time, 'Any time of year',
        ARRAY['CAR','BUS','AUTO','WALK'],
        'A decommissioned Soviet-era submarine hauled ashore and opened up, letting you walk the length of a real warship.',
        E'INS Kurusura served the Indian Navy for three decades before being beached at Ramakrishna Beach and converted into one of the few submarine museums in Asia.\n\nThe interior has been left largely intact — torpedo tubes, the control room, the impossibly narrow crew bunks. Guides are usually retired naval personnel, and their commentary is what makes the visit memorable.',
        E'Closed on Mondays.\nThe passageways are genuinely tight and not suitable for wheelchairs.\nPhotography inside is restricted in some compartments.',
        NULL
    ),
    (
        'Rushikonda Beach', 'Rushikonda Beach', 'vizag-rushikonda-beach',
        'Rushikonda, Visakhapatnam, Andhra Pradesh 530045',
        'VIZAG', 'VIEWPOINT', 17.782200::numeric, 83.386700::numeric, 0::numeric,
        '06:00'::time, '18:00'::time, 'November to February',
        ARRAY['CAR','BUS','AUTO'],
        'A sheltered crescent of golden sand backed by low hills, and the best spot on this coast for water sports.',
        E'Rushikonda is calmer than the city beaches, which is why the state tourism board runs jet-ski, kayaking and windsurfing operations here.\n\nThe headland at the northern end is worth the short scramble for a view back across the bay.',
        E'Swim only in the flagged sections — the current past the rocks is deceptively strong.\nChanging rooms are available near the main entrance for a small fee.',
        NULL
    ),
    (
        'Borra Caves', 'Borra Guhalu Limestone Caves', 'araku-borra-caves',
        'Borra, Ananthagiri Mandal, Araku Valley, Andhra Pradesh 531149',
        'ARAKU', 'ADVENTURE', 18.281900::numeric, 83.036900::numeric, 60.00::numeric,
        '10:00'::time, '17:00'::time, 'October to March',
        ARRAY['CAR','TRAIN','BUS'],
        'Million-year-old limestone caverns lit in colour, with stalactites the size of pillars and a river running through the floor.',
        E'The Borra caves were carved out by the Gosthani river, which still flows through the lowest chamber. They are among the deepest caves in India, dropping roughly 80 metres below the entrance.\n\nThe walkway is lit throughout, and the formations have picked up local names over the years — a Shiva-Parvati figure, a mother and child, a crocodile. The train journey up from Visakhapatnam through 40-odd tunnels is arguably as good as the caves themselves.',
        E'The steps are steep, uneven and often damp — hold the railing.\nIt is noticeably humid inside; carry water.\nStill photography carries a separate camera fee.',
        NULL
    ),
    (
        'Katiki Waterfalls', 'Katiki Waterfalls', 'araku-katiki-waterfalls',
        'Near Borra Caves, Ananthagiri Hills, Araku Valley, Andhra Pradesh 531149',
        'ARAKU', 'WATERFALL', 18.263100::numeric, 83.032500::numeric, 30.00::numeric,
        '08:00'::time, '17:00'::time, 'July to October, just after the monsoon',
        ARRAY['CAR','WALK'],
        'A 50-foot fall hidden in the Ananthagiri hills, reached on foot along a forest track from the Borra road.',
        E'Katiki is fed by the Gosthani and runs hardest in the weeks after the monsoon. The last stretch is a walk of roughly a kilometre through forest, part of it along the stream bed.\n\nThere is a shallow pool at the base where wading is permitted, and the surrounding rock makes a natural amphitheatre.',
        E'The trail is slippery in the rains — proper footwear matters here.\nLocal jeeps run from the Borra junction if you would rather not walk the full distance.\nThere are no shops on the trail, so carry your own water.',
        NULL
    ),
    (
        'Araku Plantations', 'Araku Valley Coffee and Tea Plantations', 'araku-coffee-plantations',
        'Araku Valley, Alluri Sitharama Raju District, Andhra Pradesh 531149',
        'ARAKU', 'TEA_PLANTATION', 18.329700::numeric, 82.874500::numeric, 0::numeric,
        '08:00'::time, '18:00'::time, 'November to February',
        ARRAY['CAR','TRAIN','BUS'],
        'Terraced hillsides of shade-grown coffee and tea, with tasting rooms run by the tribal cooperatives that farm them.',
        E'Araku coffee is grown by tribal cooperatives across these valleys and has built a genuine reputation abroad. Several estates open their drying yards and roasteries to visitors.\n\nThe Coffee Museum in Araku town explains the whole chain from cherry to cup, and the surrounding roads are some of the most pleasant driving in the state.',
        E'Estate tours are best arranged a day in advance through your hotel.\nMornings are misty and cool — bring a layer.',
        NULL
    ),
    (
        'Tribal Museum', 'Araku Tribal Museum', 'araku-tribal-museum',
        'Main Road, Araku Valley, Andhra Pradesh 531149',
        'ARAKU', 'MUSEUM', 18.327100::numeric, 82.876800::numeric, 40.00::numeric,
        '09:30'::time, '18:00'::time, 'Any time of year',
        ARRAY['CAR','TRAIN','WALK'],
        'A compact museum documenting the dress, tools, music and dwellings of the tribal communities of the Eastern Ghats.',
        E'The museum uses life-size dioramas rather than glass cases, which makes it unusually easy to read. Displays cover the Bagata, Valmiki and Konda Dora communities among others.\n\nDhimsa dance performances are held in the courtyard on most afternoons.',
        E'Allow about an hour.\nThe attached shop sells crafts directly on behalf of the artisan groups.',
        NULL
    ),
    (
        'Kanaka Durga Temple', 'Sri Durga Malleswara Swamy Varla Devasthanam', 'vijayawada-kanaka-durga-temple',
        'Indrakeeladri Hill, Vijayawada, Andhra Pradesh 520001',
        'VJA', 'RELIGIOUS_PLACE', 16.517500::numeric, 80.617700::numeric, 0::numeric,
        '04:00'::time, '21:00'::time, 'October, during Dasara',
        ARRAY['CAR','BUS','AUTO','WALK'],
        'The hilltop temple to Kanaka Durga above the Krishna river, and the spiritual centre of Vijayawada.',
        E'The temple stands on Indrakeeladri hill, where the goddess is believed to have taken permanent residence. It is one of the busiest shrines in Andhra Pradesh, particularly during the ten days of Dasara when the deity is dressed in a different form each day.\n\nThe terrace behind the main shrine gives a long view over the Krishna and the Prakasam Barrage.',
        E'Free darshan queues are long — paid darshan tickets move considerably faster.\nMobile phones and cameras are not permitted inside; use the cloakroom at the base.\nTraditional dress is expected.',
        NULL
    ),
    (
        'Prakasam Barrage', 'Prakasam Barrage', 'vijayawada-prakasam-barrage',
        'Krishna River, Vijayawada, Andhra Pradesh 520013',
        'VJA', 'LAKE_AND_DAM', 16.502800::numeric, 80.610300::numeric, 0::numeric,
        '06:00'::time, '22:00'::time, 'Evenings, year round',
        ARRAY['CAR','BUS','AUTO','WALK'],
        'A kilometre-long barrage across the Krishna, lit up after dark and doubling as the city promenade.',
        E'Built in the 1950s over the remains of a colonial anicut, the barrage feeds an irrigation network that covers most of the delta. Its 70 gates are a genuinely impressive piece of engineering.\n\nThe walkway along the top is a local evening ritual, and the Bhavani island upstream can be reached by boat.',
        E'Best visited after sunset when the span is illuminated.\nParking on the Vijayawada side is limited during festivals.',
        NULL
    ),
    (
        'Undavalli Caves', 'Undavalli Rock-Cut Cave Temples', 'vijayawada-undavalli-caves',
        'Undavalli, Tadepalle, Guntur District, Andhra Pradesh 522501',
        'VJA', 'HISTORICAL_PLACE', 16.496700::numeric, 80.578300::numeric, 25.00::numeric,
        '09:00'::time, '17:30'::time, 'November to February',
        ARRAY['CAR','BUS','AUTO'],
        'Four storeys of temple carved directly into a sandstone hillside in the fourth century, including a reclining Vishnu cut from a single block.',
        E'The Undavalli caves were cut into the hill in stages from around the 4th century, and the layers of Buddhist and Hindu use are still legible in the carving.\n\nThe centrepiece is on the second floor: a reclining Vishnu roughly five metres long, carved from one piece of granite. The upper terraces look out over paddy fields to the Krishna.',
        E'Protected by the Archaeological Survey of India — do not touch the carvings.\nThe upper floors are reached by narrow stairs with low headroom.',
        NULL
    ),
    (
        'Tirumala Temple', 'Sri Venkateswara Swamy Vaari Temple, Tirumala', 'tirupati-tirumala-temple',
        'Tirumala Hills, Tirupati, Andhra Pradesh 517504',
        'TPT', 'RELIGIOUS_PLACE', 13.683300::numeric, 79.347200::numeric, 0::numeric,
        '03:00'::time, '23:00'::time, 'September to February',
        ARRAY['CAR','BUS','TRAIN','WALK'],
        'One of the most visited places of worship anywhere in the world, set on the seven hills above Tirupati.',
        E'The temple to Venkateswara has stood on Tirumala for well over a thousand years, and receives tens of thousands of pilgrims a day. The Dravidian gopuram, the gold-plated vimana over the sanctum and the sheer scale of the operation are all remarkable.\n\nMany pilgrims still climb the Alipiri steps — around 3,500 of them — rather than take the ghat road.',
        E'Book darshan slots online well in advance; walk-in waits can run to many hours.\nMobile phones are not allowed inside the temple complex.\nA strict dress code is enforced.\nFree meals are served at the Annaprasadam hall throughout the day.',
        NULL
    ),
    (
        'SV Zoological Park', 'Sri Venkateswara Zoological Park', 'tirupati-sv-zoological-park',
        'Tirupati - Tiruchanoor Road, Tirupati, Andhra Pradesh 517503',
        'TPT', 'WILDLIFE', 13.601400::numeric, 79.457800::numeric, 50.00::numeric,
        '09:00'::time, '17:00'::time, 'October to February, early morning',
        ARRAY['CAR','BUS','AUTO'],
        'One of the largest zoos in India, laid out as open enclosures along the edge of the Seshachalam forest.',
        E'The park covers well over a thousand acres against the Seshachalam biosphere, so the enclosures are unusually generous. Tigers, lions, leopards and sloth bears are the headline residents, alongside a large collection of birds.\n\nA battery-operated vehicle runs the full circuit for anyone who would rather not walk it.',
        E'Arrive at opening — the animals retreat from view as the day heats up.\nFeeding the animals is prohibited.\nPlastic bottles are checked at the gate.',
        NULL
    ),
    (
        'Charminar', 'Charminar', 'hyderabad-charminar',
        'Char Kaman, Ghansi Bazaar, Hyderabad, Telangana 500002',
        'HYD', 'HISTORICAL_PLACE', 17.361600::numeric, 78.474700::numeric, 25.00::numeric,
        '09:30'::time, '17:30'::time, 'November to February',
        ARRAY['CAR','AUTO','WALK','BIKE'],
        'The four-minaret monument built in 1591 that has stood at the centre of Hyderabad ever since.',
        E'Charminar was raised by Muhammad Quli Qutb Shah to mark the founding of the city, and the four arches face the four original cardinal roads.\n\nA narrow spiral staircase climbs to the upper gallery, where the view takes in Mecca Masjid, the bazaars and the rooftops of the old city. The building is at its best in the hour before dusk, when the stone warms and the lights come on.',
        E'The staircase is steep, unlit in places and closes before the monument itself.\nThe surrounding streets are extremely congested — park further out and walk in.\nWatch your belongings in the bazaar crowds.',
        NULL
    ),
    (
        'Laad Bazaar', 'Laad Bazaar', 'hyderabad-laad-bazaar',
        'Laad Bazaar Road, Charminar, Hyderabad, Telangana 500002',
        'HYD', 'MARKET', 17.361200::numeric, 78.472700::numeric, 0::numeric,
        '11:00'::time, '23:00'::time, 'Evenings, and the weeks before Ramzan',
        ARRAY['AUTO','WALK'],
        'The lane running west from Charminar, lined end to end with lacquer bangles, pearls and old-city jewellery.',
        E'Laad Bazaar has traded from the same stretch for four centuries. The speciality is the lac bangle, set with stones and made in workshops directly behind the shopfronts.\n\nBeyond bangles you will find pearls, brocade, perfume oils and wedding goods. It is loud, tight and thoroughly worth an hour.',
        E'Prices are negotiable almost everywhere — expect to bargain.\nThe lane is pedestrian in practice; leave vehicles at the Charminar end.\nBusiest in the evening.',
        NULL
    ),
    (
        'NTR Gardens', 'N. T. Rama Rao Memorial Gardens', 'hyderabad-ntr-gardens',
        'Tank Bund Road, Hussain Sagar, Hyderabad, Telangana 500004',
        'HYD', 'GARDEN', 17.410400::numeric, 78.470100::numeric, 40.00::numeric,
        '14:30'::time, '20:30'::time, 'October to February, evenings',
        ARRAY['CAR','BUS','AUTO','WALK'],
        'A landscaped park on the southern bank of Hussain Sagar, with a toy train, a rose garden and lake views.',
        E'NTR Gardens was built as a memorial to the former chief minister and now serves as the green edge of the Hussain Sagar lakefront.\n\nThe layout is generous — a rose garden, a series of water features, a miniature train that loops the grounds, and long lawns facing the Buddha statue out on the lake. It links directly to Lumbini Park next door.',
        E'Opens in the afternoon only.\nA combined ticket with Lumbini Park is available at the gate.\nThe laser show at Lumbini Park pairs well with an early evening visit here.',
        NULL
    )
) AS v (
    short_name, full_name, slug, address, city_code, category_code,
    latitude, longitude, entry_fee, opening_time, closing_time, best_time,
    travel_modes, short_description, full_description, instructions
)
WHERE EXISTS (SELECT 1 FROM city WHERE code = v.city_code)
  AND EXISTS (SELECT 1 FROM category WHERE code = v.category_code)
ON CONFLICT (slug) DO NOTHING;

-- ── Images ──────────────────────────────────────────────────────────────────
INSERT INTO attraction_image (attraction_id, image_url, public_id, alt_text, display_order, is_primary)
SELECT
    a.id,
    'https://images.unsplash.com/photo-' || v.photo_id || '?w=1400&q=80&auto=format&fit=crop',
    'demo/' || v.slug || '-' || v.display_order,
    v.alt_text,
    v.display_order,
    v.is_primary
FROM (
    VALUES
    ('vizag-kailasagiri',              '1464822759023-fed622ff2c3b', 'Green hills falling away to the coastline at Kailasagiri', 0, true),
    ('vizag-submarine-museum',         '1596402184320-417e7178b2cd', 'The beached INS Kurusura submarine seen from the promenade', 0, true),
    ('vizag-rushikonda-beach',         '1501785888041-af3ef285b470', 'The curve of Rushikonda beach below wooded headlands', 0, true),
    ('araku-borra-caves',              '1441974231531-c6227db76b6e', 'Forest above the Borra cave system in the Ananthagiri hills', 0, true),
    ('araku-katiki-waterfalls',        '1518391846015-55a9cc003b25', 'Katiki waterfall dropping into a pool surrounded by forest', 0, true),
    ('araku-katiki-waterfalls',        '1432405972618-c60b0225b8f9', 'Water running over dark rock below the falls', 1, false),
    ('araku-katiki-waterfalls',        '1544735716-392fe2489ffa',    'The forest trail leading to Katiki waterfall', 2, false),
    ('araku-coffee-plantations',       '1533105079780-92b9be482077', 'Terraced coffee and tea slopes in Araku Valley', 0, true),
    ('araku-coffee-plantations',       '1582719478250-c89cae4dc85b', 'Rows of tea bushes on a misty hillside', 1, false),
    ('araku-coffee-plantations',       '1519681393784-d120267933ba', 'Hills above the Araku plantations at dusk', 2, false),
    ('araku-tribal-museum',            '1571536802807-30451e3955d8', 'Display of tribal crafts at the Araku museum', 0, true),
    ('vijayawada-kanaka-durga-temple', '1564507592333-c60657eea523', 'Temple gopuram rising above Indrakeeladri hill', 0, true),
    ('vijayawada-prakasam-barrage',    '1506905925346-21bda4d32df4', 'The Krishna river spreading out above the barrage', 0, true),
    ('vijayawada-undavalli-caves',     '1477587458883-47145ed94245', 'Rock-cut facade of the Undavalli cave temples', 0, true),
    ('tirupati-tirumala-temple',       '1512343879784-a960bf40e7f2', 'Carved temple tower on the Tirumala hills', 0, true),
    ('tirupati-sv-zoological-park',    '1470071459604-3b5ec3a7fe05', 'Forest canopy bordering the zoological park', 0, true),
    ('hyderabad-charminar',            '1548013146-72479768bada',    'The four minarets of Charminar against an evening sky', 0, true),
    ('hyderabad-charminar',            '1524492412937-b28074a5d7da', 'Detail of the arched stonework at Charminar', 1, false),
    ('hyderabad-laad-bazaar',          '1454391304352-2bf4678b1a7a', 'Bangles and jewellery stacked in a Laad Bazaar shopfront', 0, true),
    ('hyderabad-laad-bazaar',          '1555396273-367ea4eb4db5',    'Crowded market lane beside Charminar', 1, false),
    ('hyderabad-ntr-gardens',          '1503656142023-618e7d1f435a', 'Planted beds and lawns at NTR Gardens', 0, true)
) AS v (slug, photo_id, alt_text, display_order, is_primary)
JOIN attraction a ON a.slug = v.slug
ON CONFLICT (public_id) DO NOTHING;

-- ── Publish the attraction that already existed ─────────────────────────────
UPDATE attraction
SET status = 'PUBLISHED', updated_at = now()
WHERE slug = 'eluru-buddha-park' AND status = 'DRAFT';

COMMIT;
