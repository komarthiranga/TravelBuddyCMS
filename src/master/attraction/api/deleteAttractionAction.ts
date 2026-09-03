'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { deleteAttraction } from '@/master/attraction/api/deleteAttraction'
import { parseAttractionId } from '@/master/attraction/ids'

export async function deleteAttractionAction(formData: FormData) {
    const raw = formData.get('id')
    const id = parseAttractionId(typeof raw === 'string' ? raw : undefined)

    if (!id) {
        redirect('/attraction')
    }

    await deleteAttraction(id)
    revalidatePath('/attraction')
    redirect('/attraction')
}
