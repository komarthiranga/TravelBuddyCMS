import { asc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { cityTable } from '@/master/city/schema'

export async function getCitiesForSelect() {
    return db
        .select({
            id: cityTable.id,
            name: cityTable.name,
        })
        .from(cityTable)
        .where(eq(cityTable.is_active, true))
        .orderBy(asc(cityTable.name))
}
