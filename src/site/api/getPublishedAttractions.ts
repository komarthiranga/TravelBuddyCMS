import { withVerification } from '@/site/verification/load'
import type { Verification } from '@/site/verification/model'
import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'
import { attractionImageTable } from '@/master/attraction/image/schema'
import { categoryTable } from '@/master/category/schema'
import { cityTable } from '@/master/city/schema'

export type PublicAttractionCard = {
    id: number
    verification: Verification
    short_name: string
    slug: string
    city_name: string
    city_id: number
    category_name: string
    category_id: number
    address: string
    entry_fee: string
    currency_code: string
    opening_time: string | null
    closing_time: string | null
    short_description: string
    latitude: string | null
    longitude: string | null
    primary_image: string | null
    primary_image_alt: string | null
}

type PlaceFilters = {
    collection?: 'food' | 'stay'
    page?: number
    pageSize?: number
    cityId?: number
    categoryId?: number
    search?: string
    free?: boolean
    open?: boolean
}

function placeConditions(options?: PlaceFilters) {
    const conditions = [eq(attractionTable.status, 'PUBLISHED'), eq(attractionTable.is_active, true)]
    if (options?.collection) {
        const pattern = options.collection === 'food' ? 'restaurant|cafe|café|quick bites|food' : 'hotel|stay|guest house'
        conditions.push(sql`EXISTS (SELECT 1 FROM category c WHERE c.id=${attractionTable.category_id}
            AND c.name ~* ${pattern} AND c.name !~* 'grocer|milk.*delivery')`)
    }
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
    if (options?.free) {
        conditions.push(sql`cast(${attractionTable.entry_fee} as numeric) = 0 AND EXISTS (
            SELECT 1 FROM place_verification v
            WHERE v.attraction_id = ${attractionTable.id} AND v.field = 'admission' AND v.status = 'verified'
            AND v.checked_at <= CURRENT_TIMESTAMP AND v.review_due_at > CURRENT_TIMESTAMP
            AND v.value = jsonb_build_array(${attractionTable.entry_fee}::text, ${attractionTable.currency_code}::text)
            AND NOT EXISTS (SELECT 1 FROM place_verification newer WHERE newer.attraction_id=v.attraction_id AND newer.field=v.field AND newer.checked_at>v.checked_at)
        ) AND EXISTS (SELECT 1 FROM category c WHERE c.id=${attractionTable.category_id} AND c.name !~* 'restaurant|cafe|café|quick bites|food|hotel|stay|guest house|grocer|milk.*delivery')`)
    }

    if (options?.open) {
        const now = sql`(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::time`
        conditions.push(sql`EXISTS (SELECT 1 FROM place_verification v
            WHERE v.attraction_id=${attractionTable.id} AND v.field='hours' AND v.status='verified'
            AND v.checked_at <= CURRENT_TIMESTAMP AND v.review_due_at > CURRENT_TIMESTAMP
            AND v.value=jsonb_build_array(${attractionTable.opening_time}::text, ${attractionTable.closing_time}::text)
            AND NOT EXISTS (SELECT 1 FROM place_verification newer WHERE newer.attraction_id=v.attraction_id AND newer.field=v.field AND newer.checked_at>v.checked_at))`)
        conditions.push(sql`${attractionTable.opening_time} IS NOT NULL AND ${attractionTable.closing_time} IS NOT NULL AND (
            (${attractionTable.opening_time} < ${attractionTable.closing_time} AND ${now} >= ${attractionTable.opening_time} AND ${now} < ${attractionTable.closing_time}) OR
            (${attractionTable.opening_time} > ${attractionTable.closing_time} AND (${now} >= ${attractionTable.opening_time} OR ${now} < ${attractionTable.closing_time}))
        )`)
    }
    return and(...conditions)
}

export async function getAttractionSuggestions(options?: PlaceFilters) {
    return db.select({ id: attractionTable.id, name: attractionTable.short_name, category: categoryTable.name })
        .from(attractionTable)
        .innerJoin(categoryTable, eq(attractionTable.category_id, categoryTable.id))
        .where(placeConditions({ ...options, search: undefined }))
        .orderBy(attractionTable.short_name)
}

export async function getPublishedAttractions(options?: PlaceFilters): Promise<{ rows: PublicAttractionCard[]; total: number; page: number; pageCount: number; pageSize: number }> {
    const pageSize = options?.pageSize ?? 12
    const page = Math.max(1, options?.page ?? 1)
    const where = placeConditions(options)

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
            address: attractionTable.address,
            entry_fee: attractionTable.entry_fee,
            currency_code: attractionTable.currency_code,
            opening_time: attractionTable.opening_time,
            closing_time: attractionTable.closing_time,
            short_description: attractionTable.short_description,
            latitude: attractionTable.latitude,
            longitude: attractionTable.longitude,
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

    return { rows: await withVerification(rows), total: totalNum, page: safePage, pageCount, pageSize }
}

export async function getFeaturedAttractions(limit = 6, cityId?: number): Promise<PublicAttractionCard[]> {
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
            address: attractionTable.address,
            entry_fee: attractionTable.entry_fee,
            currency_code: attractionTable.currency_code,
            opening_time: attractionTable.opening_time,
            closing_time: attractionTable.closing_time,
            short_description: attractionTable.short_description,
            latitude: attractionTable.latitude,
            longitude: attractionTable.longitude,
            primary_image: primaryImages.image_url,
            primary_image_alt: primaryImages.alt_text,
        })
        .from(attractionTable)
        .innerJoin(cityTable, eq(attractionTable.city_id, cityTable.id))
        .innerJoin(categoryTable, eq(attractionTable.category_id, categoryTable.id))
        .leftJoin(primaryImages, eq(attractionTable.id, primaryImages.attraction_id))
        .where(and(eq(attractionTable.status, 'PUBLISHED'), eq(attractionTable.is_active, true), cityId ? eq(attractionTable.city_id, cityId) : undefined))
        .orderBy(desc(attractionTable.id))
        .limit(limit)
    return withVerification(rows)
}
