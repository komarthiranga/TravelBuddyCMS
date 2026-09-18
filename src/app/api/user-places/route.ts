import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { validPlaceId, type UserPlace } from '@/site/online/model'

const headers = { 'Cache-Control': 'private, no-store, max-age=0' }
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers })
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return reply({ error: 'Sign in to see your saved places.' }, 401)
    try {
        const places = await sql<UserPlace[]>`select place_id, saved, liked from traveller_place where user_id=${session.user.id} and (saved or liked) order by updated_at desc limit 500`
        return reply({ places })
    } catch { return reply({ error: 'Your saved places could not load. Please try again.' }, 503) }
}
export async function POST(request: NextRequest) {
    if (request.headers.get('origin') !== request.nextUrl.origin) return reply({ error: 'Please use TravelBuddy to update your places.' }, 403)
    const session = await auth()
    if (!session?.user?.id) return reply({ error: 'Sign in to save or like places.' }, 401)
    const userId = session.user.id
    let body
    try { body = await request.json() } catch { return reply({ error: 'Invalid request.' }, 400) }
    if (!body || !validPlaceId(body.placeId) || !['saved', 'liked'].includes(body.field) || typeof body.value !== 'boolean') return reply({ error: 'Invalid place update.' }, 400)
    try {
        const places = await sql.begin(async tx => {
            // Serialize per-user mutations so the 500-place limit also holds under concurrency.
            await tx`select id from traveller where id=${userId} for update`
            const [count] = await tx`select count(*)::int as count from traveller_place where user_id=${userId} and (saved or liked)`
            const [existing] = await tx`select place_id from traveller_place where user_id=${userId} and place_id=${body.placeId}`
            if (body.value && !existing && count.count >= 500) throw new Error('limit')
            if (body.field === 'saved') {
                await tx`insert into traveller_place (user_id, place_id, saved) values (${userId}, ${body.placeId}, ${body.value})
                    on conflict (user_id, provider, place_id) do update set saved=excluded.saved, updated_at=now()`
            } else {
                await tx`insert into traveller_place (user_id, place_id, liked) values (${userId}, ${body.placeId}, ${body.value})
                    on conflict (user_id, provider, place_id) do update set liked=excluded.liked, updated_at=now()`
            }
            await tx`delete from traveller_place where user_id=${userId} and not saved and not liked`
            return await tx<UserPlace[]>`select place_id, saved, liked from traveller_place where user_id=${userId} order by updated_at desc limit 500`
        })
        return reply({ places })
    } catch (cause) { return reply({ error: cause instanceof Error && cause.message === 'limit' ? 'You can save or like up to 500 places. Remove one first.' : 'Your change could not be saved. Please retry.' }, 503) }
}

export async function DELETE(request: NextRequest) {
    if (request.headers.get('origin') !== request.nextUrl.origin) return reply({ error: 'Please use TravelBuddy to delete your account.' }, 403)
    const session = await auth()
    if (!session?.user?.id) return reply({ error: 'Sign in first.' }, 401)
    let body
    try { body = await request.json() } catch { return reply({ error: 'Confirm account deletion.' }, 400) }
    if (body?.confirmation !== 'DELETE') return reply({ error: 'Type DELETE to confirm.' }, 400)
    try {
        await sql`delete from traveller where id=${session.user.id}`
        return reply({ deleted: true })
    } catch { return reply({ error: 'Account could not be deleted. Please retry.' }, 503) }
}
