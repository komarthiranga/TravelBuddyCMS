import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'
import { categoryTable } from '@/master/category/schema'
import { cityTable } from '@/master/city/schema'

export async function getAttractionById(id: number) {
    const [row] = await db
        .select({
            id: attractionTable.id,
            short_name: attractionTable.short_name,
            full_name: attractionTable.full_name,
            slug: attractionTable.slug,
            address: attractionTable.address,
            city_id: attractionTable.city_id,
            category_id: attractionTable.category_id,
            city_name: cityTable.name,
            category_name: categoryTable.name,
            latitude: attractionTable.latitude,
            longitude: attractionTable.longitude,
            entry_fee: attractionTable.entry_fee,
            currency_code: attractionTable.currency_code,
            opening_time: attractionTable.opening_time,
            closing_time: attractionTable.closing_time,
            best_time_to_visit: attractionTable.best_time_to_visit,
            travel_modes: attractionTable.travel_modes,
            short_description: attractionTable.short_description,
            full_description: attractionTable.full_description,
            instructions: attractionTable.instructions,
            status: attractionTable.status,
            is_active: attractionTable.is_active,
            created_at: attractionTable.created_at,
            updated_at: attractionTable.updated_at,
        })
        .from(attractionTable)
        .innerJoin(cityTable, eq(attractionTable.city_id, cityTable.id))
        .innerJoin(categoryTable, eq(attractionTable.category_id, categoryTable.id))
        .where(eq(attractionTable.id, id))
        .limit(1)

    return row ?? null
}
