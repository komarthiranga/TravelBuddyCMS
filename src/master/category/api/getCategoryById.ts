
import { requireCmsAdmin } from '@/lib/cms-auth'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { categoryTable } from '@/master/category/schema'

export async function getCategoryById(id: number) {
    await requireCmsAdmin()
    const [row] = await db
        .select()
        .from(categoryTable)
        .where(eq(categoryTable.id, id))
        .limit(1)

    return row ?? null
}
