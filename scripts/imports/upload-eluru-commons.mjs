// Reviewed venue match: Commons description identifies Brundavan Gardens, Eluru.
import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import postgres from 'postgres'
const sql=postgres(process.env.DATABASE_URL,{ssl:'require',max:1,connect_timeout:10})
try {
const page=JSON.parse(await fs.readFile('data/imports/eluru-photo-shortlist.json','utf8')).query.pages['58884991']
const info=page.imageinfo[0], meta=info.extmetadata
if(meta.LicenseShortName.value!=='CC BY-SA 4.0'||meta.LicenseUrl.value!=='https://creativecommons.org/licenses/by-sa/4.0')throw new Error('Licence changed; review required')
const [place]=await sql`select a.id from attraction a join place_source s on s.attraction_id=a.id where s.source='OpenStreetMap' and s.source_id='way/675621766' and a.short_name='Brundavan Park'`
if(!place)throw new Error('Reviewed place not found')
const publicId=`travel-buddy/commons/58884991-place-${place.id}`
const source=new URL(info.url);if(source.hostname!=='upload.wikimedia.org')throw new Error('Unexpected host');source.search=''
const response=await fetch(source,{headers:{'User-Agent':'TravelBuddyPhotoDiscovery/1.0 (https://travel-buddy-cms-xi.vercel.app/)'},signal:AbortSignal.timeout(30000)})
if(!response.ok)throw new Error('Photo download failed')
const bytes=await response.arrayBuffer();if(bytes.byteLength>15000000)throw new Error('Photo too large')
const params={overwrite:'false',public_id:publicId,timestamp:String(Math.floor(Date.now()/1000))}
const signature=createHash('sha1').update(Object.entries(params).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('&')+process.env.CLOUDINARY_API_SECRET).digest('hex')
const form=new FormData();for(const [k,v] of Object.entries(params))form.set(k,v)
form.set('api_key',process.env.CLOUDINARY_API_KEY);form.set('signature',signature);form.set('file',new Blob([bytes],{type:'image/jpeg'}),'brundavan.jpg')
const uploaded=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(process.env.CLOUDINARY_CLOUD_NAME)}/image/upload`,{method:'POST',body:form,redirect:'error',signal:AbortSignal.timeout(45000)})
if(!uploaded.ok)throw new Error(`Cloudinary HTTP ${uploaded.status}`)
const asset=await uploaded.json();if(asset.public_id!==publicId||new URL(asset.secure_url).hostname!=='res.cloudinary.com')throw new Error('Unexpected asset')
await sql.begin(async tx=>{
await tx`select pg_advisory_xact_lock(20260914)`
await tx`select id from attraction where id=${place.id} for update`
await tx`create table if not exists attraction_image_source(image_id bigint primary key references attraction_image(id) on delete cascade, source_url text not null, author text not null, license text not null, license_url text not null, captured_at text, source_payload jsonb not null)`
const [existing]=await tx`select id from attraction_image where public_id=${publicId}`
let id=existing?.id
if(!id){
const [added]=await tx`insert into attraction_image(attraction_id,image_url,public_id,alt_text,display_order,is_primary) values(${place.id},${asset.secure_url},${publicId},'Pedestrian bridge in Brundavan Gardens, Eluru at night — IM3847, 2017, CC BY-SA 4.0',0,false) returning id`;id=added.id
}
await tx`insert into attraction_image_source(image_id,source_url,author,license,license_url,captured_at,source_payload) values(${id},${info.descriptionurl},'IM3847','CC BY-SA 4.0',${meta.LicenseUrl.value},'2017-05-14',${tx.json(page)}) on conflict(image_id) do nothing`
// Replace only the generated cover, never override a user's real cover photo.
const other=await tx`select id from attraction_image where attraction_id=${place.id} and is_primary=true and public_id not like 'travel-buddy/ai-category-defaults/%' and public_id<>${publicId}`
if(!other.length){await tx`update attraction_image set is_primary=false where attraction_id=${place.id} and public_id like 'travel-buddy/ai-category-defaults/%'`;await tx`update attraction_image set is_primary=true where id=${id}`}
})
console.log(await sql`select a.short_name,i.is_primary,s.author,s.license from attraction_image i join attraction a on a.id=i.attraction_id join attraction_image_source s on s.image_id=i.id where i.public_id=${publicId}`)
}catch(e){console.error('Photo import failed:',e.code??e.message);process.exitCode=1}finally{await sql.end({timeout:2})}
