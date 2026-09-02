'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { updateCategory } from '@/master/category/api/updateCategory'
import { isUniqueViolation, parseCategoryId } from '@/master/category/db'
import {
    type CategoryFieldErrors,
    validateCategoryInput,
} from '@/master/category/validation'

export type UpdateCategoryState = {
    error?: string
    fieldErrors?: CategoryFieldErrors
}

function readString(formData: FormData, key: string) {
    const value = formData.get(key)

    if (typeof value !== 'string') {
        return ''
    }

    return value
}

export async function updateCategoryAction(
    _prevState: UpdateCategoryState,
    formData: FormData
): Promise<UpdateCategoryState> {
    const id = parseCategoryId(readString(formData, 'id'))

    if (!id) {
        return { error: 'This category could not be updated.' }
    }

    const result = validateCategoryInput({
        name: readString(formData, 'name'),
        type: readString(formData, 'type'),
        code: readString(formData, 'code'),
    })

    if (!result.ok) {
        return {
            error: 'Please fix the highlighted fields.',
            fieldErrors: result.errors,
        }
    }

    try {
        await updateCategory(id, {
            name: result.values.name,
            category_type: result.values.type,
            code: result.values.code,
        })
    } catch (error) {
        if (isUniqueViolation(error)) {
            return {
                error: 'That code is already in use. Choose a different one.',
                fieldErrors: { code: 'That code is already in use.' },
            }
        }

        return { error: 'Could not save this category. Try again.' }
    }

    revalidatePath('/category')
    revalidatePath(`/category/${id}/edit`)
    redirect('/category')
}
