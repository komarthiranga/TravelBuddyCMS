import { and, asc, desc, eq, ne } from 'drizzle-orm'

import { db } from '@/lib/db'
import { attractionImageTable } from '@/master/attraction/image/schema'

export async function getAttractionImages(attractionId: number) {
    return db
        .select()
        .from(attractionImageTable)
        .where(eq(attractionImageTable.attraction_id, attractionId))
        .orderBy(desc(attractionImageTable.is_primary), asc(attractionImageTable.display_order), asc(attractionImageTable.id))
}

export async function getAttractionImageById(id: number) {
    const [row] = await db
        .select()
        .from(attractionImageTable)
        .where(eq(attractionImageTable.id, id))
        .limit(1)

    return row ?? null
}

async function clearPrimary(attractionId: number, exceptId?: number) {
    if (exceptId) {
        await db
            .update(attractionImageTable)
            .set({ is_primary: false, updated_at: new Date() })
            .where(
                and(
                    eq(attractionImageTable.attraction_id, attractionId),
                    ne(attractionImageTable.id, exceptId)
                )
            )
        return
    }

    await db
        .update(attractionImageTable)
        .set({ is_primary: false, updated_at: new Date() })
        .where(eq(attractionImageTable.attraction_id, attractionId))
}

export async function createAttractionImage(image: {
    attraction_id: number
    image_url: string
    public_id: string
    alt_text: string | null
    display_order: number
    is_primary: boolean
}) {
    if (image.is_primary) {
        await clearPrimary(image.attraction_id)
    }

    return db.insert(attractionImageTable).values(image)
}

export async function updateAttractionImage(
    id: number,
    image: {
        attraction_id: number
        image_url: string
        public_id: string
        alt_text: string | null
        display_order: number
        is_primary: boolean
    }
) {
    if (image.is_primary) {
        await clearPrimary(image.attraction_id, id)
    }

    return db
        .update(attractionImageTable)
        .set({
            ...image,
            updated_at: new Date(),
        })
        .where(eq(attractionImageTable.id, id))
}

export async function deleteAttractionImage(id: number) {
    return db.delete(attractionImageTable).where(eq(attractionImageTable.id, id))
}
