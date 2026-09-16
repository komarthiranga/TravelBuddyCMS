import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import ts from 'typescript'
const mod={exports:{}}
new Function('exports',ts.transpileModule(await fs.readFile('src/site/services/filter.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(mod.exports)
const {filterServices,servicePhone}=mod.exports
const data=JSON.parse(await fs.readFile('scripts/services/eluru-reviewed.json','utf8'))
const publicRows=data.records.filter(r=>r.status==='published')
test('city scope excludes district and regional offices while keeping national assistance',()=>{
 const result=filterServices(publicRows,'','city','')
 assert.ok(result.some(r=>r.name==='Eluru Government Hospital'))
 assert.ok(result.some(r=>r.phone==='112'))
 assert.ok(!result.some(r=>r.area==='district'||r.area==='regional'))
 assert.ok(filterServices(publicRows,'hospitals','all','').length>filterServices(publicRows,'hospitals','city','').length)
})
test('search and category filters combine without unrelated results',()=>{
 assert.equal(filterServices(publicRows,'hospitals','all','eluru')[0].name,'Eluru Government Hospital')
 assert.equal(filterServices(publicRows,'postal','all','534425').length,6)
 assert.equal(filterServices(publicRows,'banks','all','').length,0)
})
test('unknown, malformed and expired phone records never produce calling links',()=>{
 const now=Date.parse('2026-09-16T12:00:00Z'), due='2026-10-16T00:00:00Z'
 assert.equal(servicePhone({phone:'112',review_due_at:due},now),'tel:112')
 assert.equal(servicePhone({phone:null,review_due_at:due},now),null)
 assert.equal(servicePhone({phone:'112;evil',review_due_at:due},now),null)
 assert.equal(servicePhone({phone:'112',review_due_at:'2026-09-01'},now),null)
})
test('source curation preserves missing data and quarantines suspect entries',()=>{
 assert.equal(data.records.length,40)
 assert.equal(publicRows.length,34)
 assert.equal(new Set(data.records.map(r=>r.source_key)).size,40)
 assert.ok(publicRows.filter(r=>r.category==='hospitals').every(r=>r.phone===null))
 assert.ok(!publicRows.some(r=>r.category==='banks'||r.category==='electricity'))
 assert.equal(publicRows.filter(r=>r.name.startsWith('ARDGK')).length,1)
 assert.ok(!publicRows.some(r=>['131','135','182'].includes(r.phone)))
})
