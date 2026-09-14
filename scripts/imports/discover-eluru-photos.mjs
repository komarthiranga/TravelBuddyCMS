// Read-only discovery: never assumes a category photo depicts a particular venue.
import fs from 'node:fs/promises'
import postgres from 'postgres'
const sql=postgres(process.env.DATABASE_URL,{ssl:'require',max:1,connect_timeout:10})
const report={createdAt:new Date().toISOString(),source:'Wikimedia Commons',places:[]}
try {
const places=await sql`select a.id,a.short_name,a.latitude,a.longitude,s.source_payload from attraction a join place_source s on s.attraction_id=a.id join city c on c.id=a.city_id where lower(c.name)='eluru' and s.source='OpenStreetMap' order by a.id`
if(places.length>20)throw new Error('Unexpected import scope')
for(const p of places){
 const query=`${p.short_name} Eluru`
 const url=new URL('https://commons.wikimedia.org/w/api.php')
 url.search=new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'5',prop:'imageinfo',iiprop:'url|extmetadata|mime|size',iiurlwidth:'1200'}).toString()
 const row={id:p.id,name:p.short_name,query,osmImage:p.source_payload?.tags?.image??null,candidates:[]}
 try{
 const r=await fetch(url,{headers:{'User-Agent':'TravelBuddyPhotoDiscovery/1.0 (https://travel-buddy-cms-xi.vercel.app/)'},signal:AbortSignal.timeout(20000)})
 if(!r.ok)throw new Error(`HTTP ${r.status}`)
 const data=await r.json();if(data.error)throw new Error('Commons API error')
 row.candidates=Object.values(data.query?.pages??{}).map(page=>({title:page.title,...page.imageinfo?.[0]}))
 row.status=row.candidates.length?'needs_match_review':'no_candidates'
 }catch(e){row.status='search_failed';row.error=e.message}
 report.places.push(row); console.log(`${p.short_name}: ${row.status} (${row.candidates.length})`)
 await fs.mkdir('data/imports',{recursive:true});await fs.writeFile('data/imports/eluru-photo-discovery.json',JSON.stringify(report,null,2))
 if(row.error?.includes('429'))break
}
}finally{await sql.end({timeout:2})}
