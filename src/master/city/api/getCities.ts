import { count, desc } from 'drizzle-orm'

import { db } from '@/lib/db'
import { cityTable } from '@/master/city/schema'
import {
    MASTER_PAGE_SIZE,
    MASTER_PAGE_SIZES,
    parsePage,
} from '@/master/list-pagination'

export async function getCities(options?: { page?: number; pageSize?: number }) {
    const requestedSize = options?.pageSize ?? MASTER_PAGE_SIZE
    const pageSize = (MASTER_PAGE_SIZES as readonly number[]).includes(requestedSize)
        ? requestedSize
        : MASTER_PAGE_SIZE
    const requestedPage = parsePage(String(options?.page ?? 1))

    const [totals] = await db.select({ total: count() }).from(cityTable)
    const total = Number(totals.total)
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(requestedPage, pageCount)
    const offset = (page - 1) * pageSize

    const rows =
        total === 0
            ? []
            : await db
                  .select()
                  .from(cityTable)
                  .orderBy(desc(cityTable.id))
                  .limit(pageSize)
                  .offset(offset)

    return { rows, total, page, pageSize, pageCount }
}
