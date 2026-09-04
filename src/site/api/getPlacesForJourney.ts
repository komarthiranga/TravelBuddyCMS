import { and, asc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'
import { attractionImageTable } from '@/master/attraction/image/schema'
import { categoryTable } from '@/master/category/schema'
import { cityTable } from '@/master/city/schema'

/** Everything the buddy needs to talk about a place and travel you to it. */
export type JourneyPlace = {
    id: number
    short_name: string
    slug: string
    address: string
    city_id: number
    category_id: number
    category_name: string
    category_code: string
    /** "Attraction", "Restaurant", "Stay" — set per category in the CMS. */
    category_type: string
    latitude: string | null
    longitude: string | null
    entry_fee: string
    currency_code: string
    travel_modes: string[]
    short_description: string
    best_time_to_visit: string | null
    primary_image: string | null
    primary_image_alt: string | null
}

export async function getPlacesForJourney(): Promise<JourneyPlace[]> {
    const primaryImages = db
        .select({
            attraction_id: attractionImageTable.attraction_id,
            image_url: attractionImageTable.image_url,
            alt_text: attractionImageTable.alt_text,
        })
        .from(attractionImageTable)
        .where(eq(attractionImageTable.is_primary, true))
        .as('primary_images')

    return db
        .select({
            id: attractionTable.id,
            short_name: attractionTable.short_name,
            slug: attractionTable.slug,
            address: attractionTable.address,
            city_id: attractionTable.city_id,
            category_id: attractionTable.category_id,
            category_name: categoryTable.name,
            category_code: categoryTable.code,
            category_type: categoryTable.category_type,
            latitude: attractionTable.latitude,
            longitude: attractionTable.longitude,
            entry_fee: attractionTable.entry_fee,
            currency_code: attractionTable.currency_code,
            travel_modes: attractionTable.travel_modes,
            short_description: attractionTable.short_description,
            best_time_to_visit: attractionTable.best_time_to_visit,
            primary_image: primaryImages.image_url,
            primary_image_alt: primaryImages.alt_text,
        })
        .from(attractionTable)
        .innerJoin(cityTable, eq(attractionTable.city_id, cityTable.id))
        .innerJoin(categoryTable, eq(attractionTable.category_id, categoryTable.id))
        .leftJoin(primaryImages, eq(attractionTable.id, primaryImages.attraction_id))
        .where(and(eq(attractionTable.status, 'PUBLISHED'), eq(attractionTable.is_active, true)))
        .orderBy(asc(categoryTable.name), asc(attractionTable.short_name))
}
