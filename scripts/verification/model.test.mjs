import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import ts from 'typescript'
const source = await fs.readFile('src/site/verification/model.ts','utf8')
const module = {exports:{}}
new Function('exports',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module.exports)
const {review, values, priceLabel} = module.exports
const now = Date.parse('2026-09-15T12:00:00Z')
const place = {short_name:'Test Park',address:'Test road',category_name:'Park',latitude:'16.700000',longitude:'81.100000',opening_time:'09:00:00',closing_time:'18:00:00',entry_fee:'0.00',currency_code:'INR'}
const evidence = Object.entries(values(place)).map(([field,value]) => ({field,value,status:'verified',source_url:'https://example.org/venue',checked_at:'2026-09-14T12:00:00Z',review_due_at:'2026-10-14T12:00:00Z'}))
test('address evidence does not verify entrance coordinates, hours or admission',()=>{
    const result=review(place,evidence.filter(e=>e.field==='address'),now)
    assert.equal(result.status,'partial')
    assert.deepEqual(result.checks.map(e=>e.field),['address'])
    for (const field of ['coordinates','hours','admission']) assert.ok(result.pending.includes(field))
    assert.equal(priceLabel({...place,verification:result}).en,'Entry fee not confirmed')
})
test('published data and zero fee alone do not establish verification or free entry',()=>{
    const verification=review(place,[],now)
    assert.equal(verification.status,'unverified')
    assert.equal(priceLabel({...place,verification}).en,'Entry fee not confirmed')
})
test('partial, full and expired checks produce distinct states',()=>{
    assert.equal(review(place,evidence.slice(0,2),now).status,'partial')
    assert.equal(review(place,evidence,now).status,'verified')
    assert.equal(review(place,evidence,Date.parse('2026-11-01')).status,'unverified')
    assert.equal(review(place,evidence,Date.parse('2026-09-01')).status,'unverified')
})
test('edited fields invalidate prior evidence and newer conflicts supersede checks',()=>{
    assert.ok(review({...place,address:'Changed road'},evidence,now).pending.includes('address'))
    const conflict={...evidence[4],status:'conflict',checked_at:'2026-09-15T11:00:00Z'}
    const verification=review(place,[...evidence,conflict],now)
    assert.ok(verification.pending.includes('admission'))
    assert.equal(priceLabel({...place,verification}).en,'Entry fee not confirmed')
})
test('food and rooms never inherit free admission messaging',()=>{
    const verification=review(place,evidence,now)
    assert.equal(priceLabel({...place,verification}).en,'Free entry')
    assert.equal(priceLabel({...place,category_name:'Restaurant',verification}).en,'Menu prices vary')
    assert.equal(priceLabel({...place,category_name:'Hotel',verification}).en,'Check room rates')
})
test('missing values and non-HTTPS sources cannot be verified',()=>{
    assert.equal(review(place,evidence.map(e=>({...e,source_url:'javascript:alert(1)'})),now).status,'unverified')
    const missing={...place,opening_time:null,entry_fee:null}
    const forged=evidence.map(e=>({...e,value:values(missing)[e.field]}))
    const result=review(missing,forged,now)
    assert.ok(result.pending.includes('hours'))
    assert.ok(result.pending.includes('admission'))
})
test('current conflict notes explain uncertainty without becoming verified evidence',()=>{
    const conflict={...evidence[3],status:'conflict',checked_at:'2026-09-15T11:00:00Z',notes:'Hours differ between sources.'}
    const result=review(place,[...evidence,conflict],now)
    assert.equal(result.status,'partial')
    assert.equal(result.issues[0].notes,'Hours differ between sources.')
    assert.ok(result.pending.includes('hours'))
    assert.equal(review(place,[conflict],Date.parse('2026-11-01')).issues.length,0)
    assert.equal(review({...place,opening_time:'10:00:00'},[conflict],now).issues.length,0)
})
test('milk and grocery delivery uses product prices and has no admission requirement',()=>{
    const retail={...place,category_name:'Milk & grocery delivery'}
    const verification=review(retail,[],now)
    assert.equal(priceLabel({...retail,verification}).en,'Check product prices')
    assert.ok(!verification.pending.includes('admission'))
})
