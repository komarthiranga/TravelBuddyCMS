'use server'
import { requireCmsAdmin } from '@/lib/cms-auth'


import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { deleteCity } from '@/master/city/api/deleteCity'
import { parseCityId } from '@/master/city/ids'

export async function deleteCityAction(formData: FormData) {
    await requireCmsAdmin()
    const raw = formData.get('id')
    const id = parseCityId(typeof raw === 'string' ? raw : undefined)

    if (!id) {
        redirect('/city')
    }

    await deleteCity(id)
    revalidatePath('/city')
    redirect('/city')
}
