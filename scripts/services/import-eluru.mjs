import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import postgres from 'postgres'
import { createHash } from 'node:crypto'
const file = await fs.readFile(new URL('./eluru-reviewed.json', import.meta.url), 'utf8')
const data = JSON.parse(file)
const categories = ['banks','colleges','electricity','hospitals','civic','postal','schools','helplines']
const keys = new Set()
for (const row of data.records) {
    assert.ok(!keys.has(row.source_key)); keys.add(row.source_key)
    assert.ok(categories.includes(row.category))
    assert.ok(['city','district','regional','national'].includes(row.area))
    assert.ok(['published','needs_review'].includes(row.status))
    assert.ok(row.name && row.source_key)
    assert.ok(row.phone === null || /^\+?\d{3,15}$/.test(row.phone))
    const url = new URL(row.source_url)
    assert.equal(url.protocol,'https:')
    assert.ok(['eluru.ap.gov.in','www.mha.gov.in','www.pib.gov.in'].includes(url.hostname))
}
assert.ok(Date.parse(data.review_due_at)>Date.parse(data.checked_at))
const summary={total:data.records.length,published:data.records.filter(r=>r.status==='published').length,held:data.records.filter(r=>r.status!=='published').length}
if (!process.argv.includes('--apply')) { console.log(JSON.stringify({dryRun:true,...summary})); process.exit(0) }
const sql=postgres(process.env.DATABASE_URL,{ssl:'require',max:1,connect_timeout:10})
try {
 await sql.begin(async tx=>{
    await tx`select pg_advisory_xact_lock(20260916)`
    const cities=await tx`select id from city where lower(name)='eluru' and lower(state)='andhra pradesh' and is_active=true`
    assert.equal(cities.length,1,'Expected one active Eluru city')
    await tx`create table if not exists local_service (
      id bigint generated always as identity primary key,
      city_id bigint not null references city(id),
      source_key text not null,
      name text not null,
      category text not null check(category in ('banks','colleges','electricity','hospitals','civic','postal','schools','helplines')),
      area text not null check(area in ('city','district','regional','national')),
      address text,
      phone text check(phone is null or phone ~ '^\\+?[0-9]{3,15}$'),
      pincode text,
      source_url text not null check(source_url like 'https://%'),
      status text not null check(status in ('published','needs_review','archived')),
      checked_at timestamptz not null,
      review_due_at timestamptz not null check(review_due_at>checked_at),
      review_notes text not null default '',
      import_hash text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique(city_id,source_key)
    )`
    await tx`create index if not exists local_service_city_status_idx on local_service(city_id,status,category)`
    let inserted=0
    for(const row of data.records){
      const result=await tx`insert into local_service ${tx({...row,city_id:cities[0].id,checked_at:data.checked_at,review_due_at:data.review_due_at,import_hash:createHash('sha256').update(JSON.stringify(row)).digest('hex')})} on conflict(city_id,source_key) do nothing returning id`
      inserted+=result.length
    }
    console.log(JSON.stringify({...summary,inserted,unchanged:data.records.length-inserted}))
 })
}finally{await sql.end({timeout:2})}
