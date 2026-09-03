import { asc } from 'drizzle-orm'

import { db } from '@/lib/db'
import { categoryTable } from '@/master/category/schema'

export async function getCategoriesForSelect() {
    return db
        .select({
            id: categoryTable.id,
            name: categoryTable.name,
        })
        .from(categoryTable)
        .orderBy(asc(categoryTable.name))
}
