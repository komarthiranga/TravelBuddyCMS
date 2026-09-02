import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { categoryTable } from '@/master/category/schema'

export async function deleteCategory(id: number) {
    return db.delete(categoryTable).where(eq(categoryTable.id, id))
}
