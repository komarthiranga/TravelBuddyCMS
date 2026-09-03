import { and, eq, ne } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'
import { attractionImageTable } from '@/master/attraction/image/schema'
import { categoryTable } from '@/master/category/schema'
import { cityTable } from '@/master/city/schema'
import { distanceKm, toCoords, type Coords } from '@/site/lib/geo'

export type NearbyAttraction = {
    id: number
    short_name: string
    slug: string
    city_name: string
    category_name: string
    entry_fee: string
    currency_code: string
    latitude: string | null
    longitude: string | null
    primary_image: string | null
    primary_image_alt: string | null
    /** Distance from the attraction being viewed, not from the visitor. */
    km: number | null
}

/**
 * Other published places, ordered by how far they are from the one on screen.
 * Distance is computed here rather than in SQL to avoid a PostGIS dependency —
 * the candidate set is one city, so it stays small.
 */
export async function getNearbyAttractions(
    attractionId: number,
    cityId: number,
    origin: Coords | null,
    limit = 3
): Promise<NearbyAttraction[]> {
    const primaryImages = db
        .select({
            attraction_id: attractionImageTable.attraction_id,
            image_url: attractionImageTable.image_url,
            alt_text: attractionImageTable.alt_text,
        })
        .from(attractionImageTable)
        .where(eq(attractionImageTable.is_primary, true))
        .as('primary_images')

    const rows = await db
        .select({
            id: attractionTable.id,
            short_name: attractionTable.short_name,
            slug: attractionTable.slug,
            city_name: cityTable.name,
            category_name: categoryTable.name,
            entry_fee: attractionTable.entry_fee,
            currency_code: attractionTable.currency_code,
            latitude: attractionTable.latitude,
            longitude: attractionTable.longitude,
            primary_image: primaryImages.image_url,
            primary_image_alt: primaryImages.alt_text,
        })
        .from(attractionTable)
        .innerJoin(cityTable, eq(attractionTable.city_id, cityTable.id))
        .innerJoin(categoryTable, eq(attractionTable.category_id, categoryTable.id))
        .leftJoin(primaryImages, eq(attractionTable.id, primaryImages.attraction_id))
        .where(
            and(
                eq(attractionTable.city_id, cityId),
                ne(attractionTable.id, attractionId),
                eq(attractionTable.status, 'PUBLISHED'),
                eq(attractionTable.is_active, true)
            )
        )

    return rows
        .map((row) => {
            const target = toCoords(row.latitude, row.longitude)
            return {
                ...row,
                km: origin && target ? distanceKm(origin, target) : null,
            }
        })
        .sort((a, b) => {
            if (a.km === null) return 1
            if (b.km === null) return -1
            return a.km - b.km
        })
        .slice(0, limit)
}
