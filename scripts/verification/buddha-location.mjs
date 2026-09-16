import assert from 'node:assert/strict'
import postgres from 'postgres'

// Only the geographic locality is supported by this district-government source.
// It does not establish entrance coordinates, hours, admission fees or safety.
const address = 'Gajjalavari Cheruvu, Eluru, Andhra Pradesh, India'
const source = 'https://eluru.ap.gov.in/how-to-reach/'
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 10 })
try {
    await sql.begin(async tx => {
        const [place] = await tx`select id, address from attraction where slug='eluru-buddha-park' for update`
        assert.ok(place, 'Buddha Park must exist')
        assert.equal(place.address, address, 'Address changed; review the source again before applying')
        if (!process.argv.includes('--apply')) {
            console.log(JSON.stringify({ action: 'Record address evidence only', address, source }))
            return
        }
        await tx`insert into place_verification(attraction_id,field,value,status,source_url,checked_at,review_due_at,reviewer,notes)
        values(${place.id},'address',${tx.json(address)},'verified',${source},'2026-09-16T00:00:00Z','2026-10-16T00:00:00Z',
        'Travel Buddy editorial review','Eluru District Administration identifies the Abhaya Buddha statue at Gajjalavari Cheruvu, Eluru. Confirms the geographic locality only; the exact entrance/map pin, hours and admission fee have not been verified.')
        on conflict(attraction_id,field,checked_at) do nothing`
        console.log('Buddha Park geographic-location evidence recorded. No venue details changed.')
    })
} finally { await sql.end({ timeout: 2 }) }
