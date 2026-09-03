'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { deleteAttractionImage, getAttractionImageById } from '@/master/attraction/image/api'
import { parseAttractionImageId } from '@/master/attraction/image/ids'

export async function deleteAttractionImageAction(formData: FormData) {
    const id = parseAttractionImageId(readString(formData, 'id'))

    if (!id) {
        redirect('/attraction')
    }

    const image = await getAttractionImageById(id)
    const attractionId = image?.attraction_id

    await deleteAttractionImage(id)

    if (attractionId) {
        revalidatePath(`/attraction/${attractionId}`)
        redirect(`/attraction/${attractionId}`)
    }

    redirect('/attraction')
}

function readString(formData: FormData, key: string) {
    const value = formData.get(key)

    if (typeof value !== 'string') {
        return undefined
    }

    return value
}
