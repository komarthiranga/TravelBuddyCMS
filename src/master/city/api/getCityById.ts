
import { requireCmsAdmin } from '@/lib/cms-auth'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { cityTable } from '@/master/city/schema'

export async function getCityById(id: number) {
    await requireCmsAdmin()
    const [row] = await db.select().from(cityTable).where(eq(cityTable.id, id)).limit(1)

    return row ?? null
}
