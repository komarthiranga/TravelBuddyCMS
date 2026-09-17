import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import postgres from 'postgres'
const rows = JSON.parse(await fs.readFile(new URL('./eluru.json', import.meta.url), 'utf8'))
assert.equal(new Set(rows.map(r => r.slug)).size, rows.length)
for (const r of rows) {
 assert.ok(['hotel','oyo','hostel','room'].includes(r.kind))
 assert.ok(Number.isFinite(r.latitude) && Math.abs(r.latitude)<=90)
 assert.ok(Number.isFinite(r.longitude) && Math.abs(r.longitude)<=180)
 assert.match(r.phone,/^\+[0-9]{10,15}$/)
 assert.ok(Date.parse(r.review_due_at)>Date.parse(r.checked_at))
 for (const key of ['source_url','coordinate_source_url']) assert.equal(new URL(r[key]).protocol,'https:')
}
if (!process.argv.includes('--apply')) { console.log(`Validated ${rows.length} stays; pass --apply to create and seed the table.`); process.exit(0) }
assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required')
const local = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)
const sql = postgres(process.env.DATABASE_URL,{ssl:local?false:'require',max:1,connect_timeout:10})
try {
 await sql.begin(async tx => {
  await tx`select pg_advisory_xact_lock(20260917)`
  const cities = await tx`select id from city where lower(name)='eluru' and lower(state)='andhra pradesh' and is_active=true`
  assert.equal(cities.length,1,'Expected one active Eluru city')
  await tx.unsafe(await fs.readFile(new URL('./schema.sql',import.meta.url),'utf8'))
  let inserted=0
  for(const row of rows) {
   const result=await tx`insert into stay ${tx({...row,city_id:cities[0].id})} on conflict(city_id,slug) do nothing returning id`
   inserted+=result.length
  }
  console.log(JSON.stringify({inserted,unchanged:rows.length-inserted,total:rows.length}))
 })
} finally { await sql.end({timeout:2}) }
