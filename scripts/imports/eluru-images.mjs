// Upload per-place copies of AI artwork, then attach only to imported Eluru places without images.
// Preserve the database global public_id uniqueness constraint.
import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import postgres from 'postgres'
const apply = process.argv.includes('--apply')
for (const key of ['DATABASE_URL', ...(apply ? ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] : [])]) {
    if (!process.env[key]) throw new Error(`${key} is required`)
}
function artwork(category, name) {
    const text = `${category} ${name}`.toLowerCase()
    if (/temple|devasthan|swamy|shivalayam/.test(text)) return 'temple'
    if (/restaurant|cafe|food|quick bites|market/.test(text)) return 'food'
    if (/hotel|stay|guest house/.test(text)) return 'stay'
    if (/park|garden|lake|waterfall|wildlife|viewpoint|tea plantation|adventure/.test(text)) return 'nature'
    if (/museum|historical|heritage/.test(text)) return 'culture'
    return 'explore'
}
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 10 })
try {
    const places = await sql`select a.id,a.short_name,c.name as category from attraction a
        join category c on c.id=a.category_id join city ci on ci.id=a.city_id
        where lower(ci.name)='eluru' and exists(select 1 from place_source s where s.attraction_id=a.id and s.source='OpenStreetMap')
        and not exists(select 1 from attraction_image i where i.attraction_id=a.id)
        order by a.id`
    if (places.length > 20) throw new Error('More than the expected 20 places; review scope first')
    const mapped = places.map(p => ({...p, artwork: artwork(p.category,p.short_name)}))
    console.table(mapped.map(p=>({place:p.short_name,artwork:p.artwork})))
    if (!apply) { console.log(`Dry run: ${mapped.length} places need images. No writes.`) }
    else {
        const uploads = new Map()
        for (const place of mapped) {
            const kind = place.artwork
            const bytes=await fs.readFile(`public/images/categories/${kind}.webp`)
            const hash=createHash('sha256').update(bytes).digest('hex').slice(0,12)
            const params={overwrite:'false',public_id:`travel-buddy/ai-category-defaults/${kind}-${hash}-place-${place.id}`,timestamp:String(Math.floor(Date.now()/1000))}
            const signed=Object.entries(params).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('&')
            const signature=createHash('sha1').update(signed+process.env.CLOUDINARY_API_SECRET).digest('hex')
            const form=new FormData()
            for(const [k,v] of Object.entries(params)) form.set(k,v)
            form.set('api_key',process.env.CLOUDINARY_API_KEY);form.set('signature',signature)
            form.set('file',new Blob([bytes],{type:'image/webp'}),`${kind}.webp`)
            const response=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(process.env.CLOUDINARY_CLOUD_NAME)}/image/upload`,{method:'POST',body:form,redirect:'error',signal:AbortSignal.timeout(45000)})
            if(!response.ok)throw new Error(`Cloudinary ${kind} upload failed: HTTP ${response.status}`)
            const data=await response.json()
            if(data.public_id!==params.public_id || !data.secure_url || new URL(data.secure_url).hostname!=='res.cloudinary.com' || !data.secure_url.startsWith('https://'))throw new Error('Unexpected upload response')
            uploads.set(place.id,data)
            console.log(`Cloudinary artwork ready: ${kind}`)
        }
        const inserted=await sql.begin(async tx=>{
            await tx`select pg_advisory_xact_lock(20260914)`
            const ids=[]
            for(const p of mapped){
                await tx`select id from attraction where id=${p.id} for update`
                const image=uploads.get(p.id)
                const alt=`AI-generated ${p.category.toLowerCase()} illustration; not a photo of ${p.short_name}`.slice(0,300)
                const added=await tx`insert into attraction_image(attraction_id,image_url,public_id,alt_text,display_order,is_primary)
                    select ${p.id},${image.secure_url},${image.public_id},${alt},0,true
                    where not exists(select 1 from attraction_image where attraction_id=${p.id}) returning attraction_id`
                ids.push(...added.map(r=>r.attraction_id))
            }
            return ids
        })
        console.log({linked:inserted.length,assets:uploads.size})
        console.log(await sql`select count(*)::int as linked_places,count(distinct i.public_id)::int as assets
            from attraction_image i join attraction a on a.id=i.attraction_id join city c on c.id=a.city_id
            where lower(c.name)='eluru' and i.public_id like 'travel-buddy/ai-category-defaults/%'
            and exists(select 1 from place_source s where s.attraction_id=a.id and s.source='OpenStreetMap')`)
    }
} catch(error) { console.error({code:error.code, constraint:error.constraint_name, column:error.column_name, table:error.table_name}); console.error(error.message?.startsWith('Cloudinary') ? error.message : 'Image import failed. No credentials logged. Check configuration and database access.');process.exitCode=1 }
finally {await sql.end({timeout:2})}
