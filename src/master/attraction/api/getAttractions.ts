import { count, desc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'
import { categoryTable } from '@/master/category/schema'
import { cityTable } from '@/master/city/schema'
import {
    MASTER_PAGE_SIZE,
    MASTER_PAGE_SIZES,
    parsePage,
} from '@/master/list-pagination'

export async function getAttractions(options?: { page?: number; pageSize?: number }) {
    const requestedSize = options?.pageSize ?? MASTER_PAGE_SIZE
    const pageSize = (MASTER_PAGE_SIZES as readonly number[]).includes(requestedSize)
        ? requestedSize
        : MASTER_PAGE_SIZE
    const requestedPage = parsePage(String(options?.page ?? 1))

    const [totals] = await db.select({ total: count() }).from(attractionTable)
    const total = Number(totals.total)
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(requestedPage, pageCount)
    const offset = (page - 1) * pageSize

    const rows =
        total === 0
            ? []
            : await db
                  .select({
                      id: attractionTable.id,
                      short_name: attractionTable.short_name,
                      slug: attractionTable.slug,
                      status: attractionTable.status,
                      is_active: attractionTable.is_active,
                      updated_at: attractionTable.updated_at,
                      city_name: cityTable.name,
                      category_name: categoryTable.name,
                  })
                  .from(attractionTable)
                  .innerJoin(cityTable, eq(attractionTable.city_id, cityTable.id))
                  .innerJoin(categoryTable, eq(attractionTable.category_id, categoryTable.id))
                  .orderBy(desc(attractionTable.id))
                  .limit(pageSize)
                  .offset(offset)

    return { rows, total, page, pageSize, pageCount }
}
