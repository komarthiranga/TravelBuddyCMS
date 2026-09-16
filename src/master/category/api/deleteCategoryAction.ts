'use server'
import { requireCmsAdmin } from '@/lib/cms-auth'


import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { deleteCategory } from '@/master/category/api/deleteCategory'
import { parseCategoryId } from '@/master/category/db'

export async function deleteCategoryAction(formData: FormData) {
    await requireCmsAdmin()
    const raw = formData.get('id')
    const id = parseCategoryId(typeof raw === 'string' ? raw : undefined)

    if (!id) {
        redirect('/category')
    }

    await deleteCategory(id)
    revalidatePath('/category')
    redirect('/category')
}
