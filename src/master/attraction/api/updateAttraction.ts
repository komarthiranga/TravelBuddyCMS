import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'

export async function updateAttraction(
    id: number,
    attraction: {
        short_name: string
        full_name: string
        slug: string
        address: string
        city_id: number
        category_id: number
        latitude: string | null
        longitude: string | null
        entry_fee: string
        currency_code: string
        opening_time: string | null
        closing_time: string | null
        best_time_to_visit: string | null
        travel_modes: string[]
        short_description: string
        full_description: string | null
        instructions: string | null
        status: string
        is_active: boolean
    }
) {
    return db
        .update(attractionTable)
        .set({
            ...attraction,
            updated_at: new Date(),
        })
        .where(eq(attractionTable.id, id))
}
