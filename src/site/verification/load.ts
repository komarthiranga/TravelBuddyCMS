import 'server-only'
import { sql } from '@/lib/db'
import { review, type Evidence, type Reviewable } from './model'

export async function withVerification<T extends Reviewable & { id: number }>(places: T[]) {
    if (!places.length) return []
    const records = await sql<(Evidence & { attraction_id: string })[]>`
        select attraction_id, field, value, status, source_url, notes,
            checked_at::text, review_due_at::text from place_verification
        where attraction_id in ${sql(places.map(place => place.id))}`
    return places.map(place => ({ ...place, verification: review(place, records.filter(r => String(r.attraction_id) === String(place.id))) }))
}
