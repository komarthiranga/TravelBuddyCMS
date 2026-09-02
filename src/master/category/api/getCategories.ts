import { count, desc } from 'drizzle-orm'

import { db } from '@/lib/db'
import {
    CATEGORY_PAGE_SIZE,
    CATEGORY_PAGE_SIZES,
    parseCategoryPage,
} from '@/master/category/pagination'
import { categoryTable } from '@/master/category/schema'

export async function getCategories(options?: { page?: number; pageSize?: number }) {
    const requestedSize = options?.pageSize ?? CATEGORY_PAGE_SIZE
    const pageSize = (CATEGORY_PAGE_SIZES as readonly number[]).includes(requestedSize)
        ? requestedSize
        : CATEGORY_PAGE_SIZE
    const requestedPage = parseCategoryPage(String(options?.page ?? 1))

    const [totals] = await db.select({ total: count() }).from(categoryTable)
    const total = Number(totals.total)
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(requestedPage, pageCount)
    const offset = (page - 1) * pageSize

    const rows =
        total === 0
            ? []
            : await db
                  .select()
                  .from(categoryTable)
                  .orderBy(desc(categoryTable.id))
                  .limit(pageSize)
                  .offset(offset)

    return { rows, total, page, pageSize, pageCount }
}
