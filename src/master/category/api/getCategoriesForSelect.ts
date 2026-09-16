
import { requireCmsAdmin } from '@/lib/cms-auth'
import { asc } from 'drizzle-orm'

import { db } from '@/lib/db'
import { categoryTable } from '@/master/category/schema'

export async function getCategoriesForSelect() {
    await requireCmsAdmin()
    return db
        .select({
            id: categoryTable.id,
            name: categoryTable.name,
        })
        .from(categoryTable)
        .orderBy(asc(categoryTable.name))
}
