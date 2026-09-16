
import { requireCmsAdmin } from '@/lib/cms-auth'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { categoryTable } from '@/master/category/schema'

export async function updateCategory(
    id: number,
    category: { name: string; category_type: string; code: string }
) {
    await requireCmsAdmin()
    return db
        .update(categoryTable)
        .set({
            ...category,
            updated_at: new Date(),
        })
        .where(eq(categoryTable.id, id))
}
