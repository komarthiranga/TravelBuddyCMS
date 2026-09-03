import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionTable } from '@/master/attraction/schema'

export async function deleteAttraction(id: number) {
    return db.delete(attractionTable).where(eq(attractionTable.id, id))
}
