
import { requireCmsAdmin } from '@/lib/cms-auth'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'

export async function deleteAttraction(id: number) {
    await requireCmsAdmin()
    return db.delete(attractionTable).where(eq(attractionTable.id, id))
}
