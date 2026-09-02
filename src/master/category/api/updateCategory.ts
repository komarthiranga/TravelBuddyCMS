import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { categoryTable } from '@/master/category/schema'

export async function updateCategory(
    id: number,
    category: { name: string; category_type: string; code: string }
) {
    return db
        .update(categoryTable)
        .set({
            ...category,
            updated_at: new Date(),
        })
        .where(eq(categoryTable.id, id))
}
