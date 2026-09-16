// Reviewed corrections from 15 September 2026. Dry run unless --apply is provided.
import fs from 'node:fs/promises'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 10 })
const placeholder = 'Eluru area — street address not yet verified'
const navAddress = '662, 26th Division, near the overbridge, Narasimharao Pet, Eluru, Andhra Pradesh'
const navSource = 'https://www.zomato.com/eluru/navayuga-fast-foods-eluru-locality/order'
const plan = [
    { id:13, name:'Navayuga Fast Foods', old:'Quick bites mapped in the Eluru area. Visiting details have not yet been verified.', address:navAddress,
        description:'A South Indian food stop near the overbridge in Narasimharao Pet. Address checked against an online restaurant listing; confirm opening hours and current menu before visiting.' },
    { id:10, name:'Milk n More (Eluru)', old:'Cafe mapped in the Eluru area. Visiting details have not yet been verified.',
        description:'A milk and grocery delivery business. Confirm delivery coverage and pickup availability directly; a sit-down cafe has not been verified.' },
    { id:14, name:'Punnami Family Restaurant', old:'Restaurant mapped in the Eluru area. Visiting details have not yet been verified.',
        description:'Confirm dine-in availability before travelling. Online ordering information does not establish whether this restaurant is currently open to visitors.' },
    { id:18, name:'Brundavan Park', old:'Park mapped in the Eluru area. Visiting details have not yet been verified.',
        description:'A park in Eluru. Online sources list different opening hours; confirm today’s access and entry fee before visiting.' },
    { id:16, name:'Vihari Robo Restaurant', old:'Restaurant mapped in the Eluru area. Visiting details have not yet been verified.',
        description:'A robot-themed restaurant listed in Powerpet. Confirm the exact entrance and current service before travelling; online listings use different street descriptions.' },
]
try {
    console.log(plan.map(p => ({ id:p.id, name:p.name, address:p.address, description:p.description })))
    if (!process.argv.includes('--apply')) {
        console.log('Dry run. Add --apply to update the reviewed fields and evidence.')
    } else {
        await sql.begin(async tx => {
            await tx`select pg_advisory_xact_lock(20260915)`
            const rows = await tx`select * from attraction where id in ${tx(plan.map(p=>p.id))} for update`
            for (const change of plan) {
                const row=rows.find(r=>Number(r.id)===change.id)
                if (!row || row.short_name!==change.name || ![change.old,change.description].includes(row.short_description)) throw new Error(`Listing ${change.id} changed; review before overwriting`)
                if (change.address && ![placeholder,change.address].includes(row.address)) throw new Error('Address changed; review needed')
            }
            const backup=`/tmp/travel-buddy-reconciliation-${Date.now()}.json`
            await fs.writeFile(backup,JSON.stringify(rows,null,2),{mode:0o600,flag:'wx'})
            console.log('Previous records saved to',backup)
            let [category]=await tx`select id from category where code='MILK_GROCERY_DELIVERY'`
            if (!category) [category]=await tx`insert into category(name,category_type,code) values('Milk & grocery delivery','Service','MILK_GROCERY_DELIVERY') returning id`
            for (const change of plan) {
                await tx`update attraction set short_description=${change.description}, updated_at=now() where id=${change.id}`
                if (change.address) await tx`update attraction set address=${change.address} where id=${change.id}`
            }
            await tx`update attraction set category_id=${category.id} where id=10`
            async function evidence(id,field,value,status,source,notes) {
                // Stable editorial review batch, idempotent on rerun.
                await tx`insert into place_verification(attraction_id,field,value,status,source_url,checked_at,review_due_at,reviewer,notes)
                values(${id},${field},${tx.json(value)},${status},${source},'2026-09-15T00:00:00Z','2026-10-15T00:00:00Z','Travel Buddy editorial review',${notes})
                on conflict(attraction_id,field,checked_at) do nothing`
            }
            await evidence(13,'name','Navayuga Fast Foods','verified',navSource,'Restaurant name checked against Zomato; no operational-status guarantee.')
            await evidence(13,'address',navAddress,'verified',navSource,'Street and overbridge landmark checked against Zomato; Swiggy corroborates the locality. Exact entrance coordinates are still pending.')
            const hours=id=>{const row=rows.find(r=>Number(r.id)===id);return [row.opening_time,row.closing_time]}
            await evidence(14,'hours',hours(14),'pending','https://www.zomato.com/cs/eluru/punnami-unlimited-family-restaurant-eluru-locality/menu','The reviewed Punnami Unlimited listing says online ordering is unavailable. That does not prove the dine-in venue is closed, and the exact listing match still needs confirmation.')
            await evidence(18,'hours',hours(18),'conflict','https://mapcarta.com/W675621766','Mapcarta lists Monday–Saturday 7 AM–8 PM, while Waze lists evening hours of 5–10 PM. Current visiting hours have not been confirmed with the park.')
            await evidence(16,'address',rows.find(r=>Number(r.id)===16).address,'pending','https://fuddo.in/local/vihari-robo-restaurant-eluru?action=select_time&menu_page=true','Listings use Powerpet Station Road and Chunduri Vari Street. These may be alternate approaches or different listings; confirm the exact entrance before following the map pin.')
            await evidence(10,'hours',hours(10),'pending','https://milknmore.org/','The official website describes milk and grocery delivery. Walk-in pickup, a dining area and local outlet hours have not been verified.')
        })
        console.log(await sql`select a.id,a.short_name,a.address,c.name category from attraction a join category c on c.id=a.category_id where a.id in ${sql(plan.map(p=>p.id))} order by a.id`)
    }
} finally { await sql.end({ timeout:2 }) }
