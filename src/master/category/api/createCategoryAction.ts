'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createCategory } from '@/master/category/api/createCategory'
import { isUniqueViolation } from '@/master/category/db'
import {
    type CategoryFieldErrors,
    validateCategoryInput,
} from '@/master/category/validation'

export type CreateCategoryState = {
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

export async function createCategoryAction(
    _prevState: CreateCategoryState,
    formData: FormData
): Promise<CreateCategoryState> {
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
        await createCategory({
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
    redirect('/category')
}
