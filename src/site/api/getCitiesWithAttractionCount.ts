import { and, asc, count, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'
import { cityTable } from '@/master/city/schema'

export type CityWithCount = {
    id: number
    name: string
    state: string
    country: string
    attraction_count: number
}

/**
 * Every active city, with how many of its attractions are publicly visible.
 * Cities with zero published attractions are still returned so the destination
 * grid is never empty while content is still being drafted.
 */
export async function getCitiesWithAttractionCount(): Promise<CityWithCount[]> {
    const rows = await db
        .select({
            id: cityTable.id,
            name: cityTable.name,
            state: cityTable.state,
            country: cityTable.country,
            attraction_count: count(attractionTable.id),
        })
        .from(cityTable)
        .leftJoin(
            attractionTable,
            and(
                eq(attractionTable.city_id, cityTable.id),
                eq(attractionTable.status, 'PUBLISHED'),
                eq(attractionTable.is_active, true)
            )
        )
        .where(eq(cityTable.is_active, true))
        .groupBy(cityTable.id, cityTable.name, cityTable.state, cityTable.country)
        .orderBy(asc(cityTable.name))

    return rows
        .map((row) => ({ ...row, attraction_count: Number(row.attraction_count) }))
        .sort((a, b) => b.attraction_count - a.attraction_count || a.name.localeCompare(b.name))
}
