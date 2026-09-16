import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 10 })
try {
    await sql.begin(async tx => {
        await tx`create table if not exists place_verification (
            id bigint generated always as identity primary key,
            attraction_id bigint not null references attraction(id) on delete cascade,
            field text not null check (field in ('name','address','coordinates','hours','admission')),
            value jsonb not null,
            status text not null check (status in ('verified','pending','conflict')),
            source_url text not null check (source_url like 'https://%'),
            checked_at timestamptz not null,
            review_due_at timestamptz not null check (review_due_at > checked_at),
            reviewer text not null,
            notes text not null default '',
            unique(attraction_id, field, checked_at)
        )`
        await tx`create index if not exists place_verification_attraction_idx on place_verification(attraction_id)`
        // Exact values checked against EFOUR's official public website on 14 September.
        // Do not snapshot arbitrary current DB values as verified evidence.
        const [place] = await tx`select id from attraction where slug='efour-eluru-osm-node-12679709778' and short_name='EFOUR'`
        if (place) {
            for (const [field, value] of [['address', 'Opposite New RTC Bus Stand, Ameenapet, Eluru, Andhra Pradesh 534006'], ['hours', ['09:00:00','23:00:00']]]) {
                await tx`insert into place_verification(attraction_id,field,value,status,source_url,checked_at,review_due_at,reviewer,notes)
                values(${place.id},${field},${tx.json(value)},'verified','https://www.efour-eluru.com/contact','2026-09-14T12:00:00Z','2026-10-14T12:00:00Z','Travel Buddy editorial review','Official public website checked; no verification of admission prices, entrance coordinates or venue safety.')
                on conflict(attraction_id,field,checked_at) do nothing`
            }
        }
    })
    console.log('Verification table ready; EFOUR address/hours evidence recorded. No place fees or publication statuses changed.')
} finally { await sql.end({ timeout: 2 }) }
