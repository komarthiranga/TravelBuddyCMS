
import { requireCmsAdmin } from '@/lib/cms-auth'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { cityTable } from '@/master/city/schema'

export async function deleteCity(id: number) {
    await requireCmsAdmin()
    return db.delete(cityTable).where(eq(cityTable.id, id))
}
