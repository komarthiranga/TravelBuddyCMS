import { and, asc, desc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'
import { attractionImageTable } from '@/master/attraction/image/schema'
import { categoryTable } from '@/master/category/schema'
import { cityTable } from '@/master/city/schema'

export type PublicAttractionDetail = {
    id: number
    short_name: string
    full_name: string
    slug: string
    address: string
    city_name: string
    city_id: number
    city_state: string
    city_country: string
    category_name: string
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
}

export type PublicAttractionImage = {
    id: number
    image_url: string
    alt_text: string | null
    display_order: number
    is_primary: boolean
}

export async function getPublishedAttractionBySlug(slug: string): Promise<{
    attraction: PublicAttractionDetail
    images: PublicAttractionImage[]
} | null> {
    const [row] = await db
        .select({
            id: attractionTable.id,
            short_name: attractionTable.short_name,
            full_name: attractionTable.full_name,
            slug: attractionTable.slug,
            address: attractionTable.address,
            city_name: cityTable.name,
            city_id: attractionTable.city_id,
            city_state: cityTable.state,
            city_country: cityTable.country,
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
        })
        .from(attractionTable)
        .innerJoin(cityTable, eq(attractionTable.city_id, cityTable.id))
        .innerJoin(categoryTable, eq(attractionTable.category_id, categoryTable.id))
        .where(
            and(
                eq(attractionTable.slug, slug),
                eq(attractionTable.status, 'PUBLISHED'),
                eq(attractionTable.is_active, true),
            )
        )
        .limit(1)

    if (!row) return null

    const images = await db
        .select({
            id: attractionImageTable.id,
            image_url: attractionImageTable.image_url,
            alt_text: attractionImageTable.alt_text,
            display_order: attractionImageTable.display_order,
            is_primary: attractionImageTable.is_primary,
        })
        .from(attractionImageTable)
        .where(eq(attractionImageTable.attraction_id, row.id))
        .orderBy(desc(attractionImageTable.is_primary), asc(attractionImageTable.display_order))

    return { attraction: row, images }
}
