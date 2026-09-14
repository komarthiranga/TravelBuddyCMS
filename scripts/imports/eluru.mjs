// Import an OpenStreetMap Overpass JSON export. Dry run unless --apply is supplied.
// No commercial Google/Foursquare API response is accepted by this importer.
import fs from 'node:fs/promises'
import postgres from 'postgres'
const args = process.argv.slice(2)
const input = args.find(arg => arg.startsWith('--file='))?.slice(7)
if (!input || args.some(arg => arg !== '--apply' && !arg.startsWith('--file='))) {
    console.error('Usage: node --env-file=.env.local scripts/imports/eluru.mjs --file=/path/to/overpass.json [--apply]')
    process.exit(1)
}
const data = JSON.parse(await fs.readFile(input, 'utf8'))
if (data.remark || !Array.isArray(data.elements) || !data.osm3s || !String(data.generator).includes('Overpass')) throw new Error('Expected a complete, unmodified Overpass JSON export')
const types = {
    restaurant: ['Restaurant', 'Restaurant', 'RESTAURANT'], cafe: ['Cafe', 'Restaurant', 'CAFE'], fast_food: ['Quick bites', 'Restaurant', 'FAST_FOOD'],
    hotel: ['Hotel', 'Stay', 'HOTEL'], guest_house: ['Guest house', 'Stay', 'GUEST_HOUSE'],
    park: ['Park', 'Attraction', 'PARK'], museum: ['Museum', 'Attraction', 'MUSEUM'], attraction: ['Attraction', 'Attraction', 'ATTRACTION'],
    place_of_worship: ['Religious Place', 'Attraction', 'RELIGIOUS_PLACE'],
}
const seen = new Set()
const rows = []
for (const element of data.elements) {
    const tag = element.tags ?? {}
    const kind = [tag.tourism, tag.amenity, tag.leisure].find(value => Object.hasOwn(types, value))
    const name = tag['name:en'] ?? tag.name
    const lat = element.lat ?? element.center?.lat
    const lon = element.lon ?? element.center?.lon
    if (!types[kind] || typeof name !== 'string' || !name.trim() || name.length > 150) continue
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 16.66 || lat > 16.76 || lon < 81.04 || lon > 81.15) continue
    if (!['node', 'way', 'relation'].includes(element.type) || !Number.isSafeInteger(element.id)) continue
    if (tag.disused === 'yes' || tag.abandoned === 'yes' || tag['disused:amenity'] || tag['disused:tourism']) continue
    const key = `${element.type}/${element.id}`
    // Reviewed exclusion: "Telugu" does not identify a usable attraction.
    if (key === 'node/4426326391') continue
    const nameKey = name.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
    if (seen.has(key) || seen.has(nameKey)) continue
    seen.add(key); seen.add(nameKey)
    rows.push({ key, name, lat, lon, category: types[kind], raw: element,
        address: [tag['addr:housenumber'], tag['addr:street'], tag['addr:suburb'], tag['addr:city'], tag['addr:postcode']].filter(Boolean).join(', ') || 'Eluru area — street address not yet verified',
    })
}
if (rows.length < 20) throw new Error(`Only ${rows.length} valid candidate records; need 20. Nothing written.`)
const selected = rows.slice(0, 20)
console.table(selected.map(({key,name,category}) => ({ source: key, name, category: category[0] })))
if (!args.includes('--apply')) { console.log('Dry run: 20 candidates. No writes. Source facts and location must be reviewed before publication.'); process.exit(0) }
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required; no writes made')
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 10 })
try {
    const result = await sql.begin(async tx => {
        await tx`select pg_advisory_xact_lock(20260914)`
        const [city] = await tx`select id from city where lower(name)='eluru' and lower(state)='andhra pradesh'`
        if (!city) throw new Error('Eluru city is missing')
        // Nullable fees distinguish unavailable information from verified free entry.
        await tx`alter table attraction alter column entry_fee drop not null`
        await tx`create table if not exists place_source (
            id bigint generated always as identity primary key,
            attraction_id bigint not null references attraction(id) on delete cascade,
            source text not null, source_id text not null, source_url text not null,
            license text not null, source_payload jsonb not null,
            imported_at timestamptz not null default now(), unique(source, source_id)
        )`
        let inserted = 0; let skipped = 0
        for (const row of selected) {
            if ((await tx`select id from place_source where source='OpenStreetMap' and source_id=${row.key}`).length || (await tx`select id from attraction where city_id=${city.id} and lower(short_name)=lower(${row.name})`).length) { skipped++; continue }
            let [category] = await tx`select id from category where code=${row.category[2]}`
            if (!category) [category] = await tx`insert into category(name,category_type,code) values(${row.category[0]},${row.category[1]},${row.category[2]}) returning id`
            const slug = `${row.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'place'}-eluru-osm-${row.key.replace('/','-')}`
            const [place] = await tx`insert into attraction(short_name,full_name,slug,address,city_id,category_id,latitude,longitude,entry_fee,short_description,full_description,instructions,status)
                values(${row.name},${row.name},${slug},${row.address},${city.id},${category.id},${row.lat},${row.lon},null,
                ${`${row.category[0]} mapped in the Eluru area. Visiting details have not yet been verified.`},
                ${`Source: OpenStreetMap contributors. https://www.openstreetmap.org/${row.key} — ODbL 1.0. Imported map data, not a verified local recommendation.`},
                'Hours, prices, facilities and access are unverified. Confirm with the venue before travelling.', 'DRAFT') returning id`
            await tx`insert into place_source(attraction_id,source,source_id,source_url,license,source_payload) values(${place.id},'OpenStreetMap',${row.key},${`https://www.openstreetmap.org/${row.key}`},'ODbL-1.0',${tx.json(row.raw)})`
            inserted++
        }
        return { inserted, skipped, status: 'DRAFT' }
    })
    console.log(result)
} finally { await sql.end({ timeout: 2 }) }
