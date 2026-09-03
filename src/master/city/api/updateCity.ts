import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { cityTable } from '@/master/city/schema'

export async function updateCity(
    id: number,
    city: {
        name: string
        code: string
        state: string
        country: string
        latitude: string | null
        longitude: string | null
        is_active: boolean
    }
) {
    return db
        .update(cityTable)
        .set({
            ...city,
            updated_at: new Date(),
        })
        .where(eq(cityTable.id, id))
}
