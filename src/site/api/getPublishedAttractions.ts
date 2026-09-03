import { and, count, desc, eq, ilike, or } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'
import { attractionImageTable } from '@/master/attraction/image/schema'
import { categoryTable } from '@/master/category/schema'
import { cityTable } from '@/master/city/schema'

export type PublicAttractionCard = {
    id: number
    short_name: string
    slug: string
    city_name: string
    city_id: number
    category_name: string
    category_id: number
    entry_fee: string
    currency_code: string
    short_description: string
    primary_image: string | null
    primary_image_alt: string | null
}

export async function getPublishedAttractions(options?: {
    page?: number
    pageSize?: number
    cityId?: number
    categoryId?: number
    search?: string
}): Promise<{ rows: PublicAttractionCard[]; total: number; page: number; pageCount: number; pageSize: number }> {
    const pageSize = options?.pageSize ?? 12
    const page = Math.max(1, options?.page ?? 1)

    const conditions = [eq(attractionTable.status, 'PUBLISHED'), eq(attractionTable.is_active, true)]
    if (options?.cityId) conditions.push(eq(attractionTable.city_id, options.cityId))
    if (options?.categoryId) conditions.push(eq(attractionTable.category_id, options.categoryId))
    if (options?.search) {
        conditions.push(
            or(
                ilike(attractionTable.short_name, `%${options.search}%`),
                ilike(attractionTable.short_description, `%${options.search}%`),
            )!
        )
    }

    const where = and(...conditions)

    const [{ total }] = await db
        .select({ total: count() })
        .from(attractionTable)
        .where(where)

    const totalNum = Number(total)
    const pageCount = Math.max(1, Math.ceil(totalNum / pageSize))
    const safePage = Math.min(page, pageCount)

    if (totalNum === 0) {
        return { rows: [], total: 0, page: 1, pageCount: 1, pageSize }
    }

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
            city_id: attractionTable.city_id,
            category_name: categoryTable.name,
            category_id: attractionTable.category_id,
            entry_fee: attractionTable.entry_fee,
            currency_code: attractionTable.currency_code,
            short_description: attractionTable.short_description,
            primary_image: primaryImages.image_url,
            primary_image_alt: primaryImages.alt_text,
        })
        .from(attractionTable)
        .innerJoin(cityTable, eq(attractionTable.city_id, cityTable.id))
        .innerJoin(categoryTable, eq(attractionTable.category_id, categoryTable.id))
        .leftJoin(primaryImages, eq(attractionTable.id, primaryImages.attraction_id))
        .where(where)
        .orderBy(desc(attractionTable.id))
        .limit(pageSize)
        .offset((safePage - 1) * pageSize)

    return { rows, total: totalNum, page: safePage, pageCount, pageSize }
}

export async function getFeaturedAttractions(limit = 6): Promise<PublicAttractionCard[]> {
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
            city_name: cityTable.name,
            city_id: attractionTable.city_id,
            category_name: categoryTable.name,
            category_id: attractionTable.category_id,
            entry_fee: attractionTable.entry_fee,
            currency_code: attractionTable.currency_code,
            short_description: attractionTable.short_description,
            primary_image: primaryImages.image_url,
            primary_image_alt: primaryImages.alt_text,
        })
        .from(attractionTable)
        .innerJoin(cityTable, eq(attractionTable.city_id, cityTable.id))
        .innerJoin(categoryTable, eq(attractionTable.category_id, categoryTable.id))
        .leftJoin(primaryImages, eq(attractionTable.id, primaryImages.attraction_id))
        .where(and(eq(attractionTable.status, 'PUBLISHED'), eq(attractionTable.is_active, true)))
        .orderBy(desc(attractionTable.id))
        .limit(limit)
}
