import { and, asc, count, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'
import { categoryTable } from '@/master/category/schema'

export type CategoryWithCount = {
    id: number
    name: string
    code: string
    attraction_count: number
}

export async function getCategoriesWithAttractionCount(): Promise<CategoryWithCount[]> {
    const rows = await db
        .select({
            id: categoryTable.id,
            name: categoryTable.name,
            code: categoryTable.code,
            attraction_count: count(attractionTable.id),
        })
        .from(categoryTable)
        .leftJoin(
            attractionTable,
            and(
                eq(attractionTable.category_id, categoryTable.id),
                eq(attractionTable.status, 'PUBLISHED'),
                eq(attractionTable.is_active, true)
            )
        )
        .groupBy(categoryTable.id, categoryTable.name, categoryTable.code)
        .orderBy(asc(categoryTable.name))

    return rows.map((row) => ({ ...row, attraction_count: Number(row.attraction_count) }))
}
