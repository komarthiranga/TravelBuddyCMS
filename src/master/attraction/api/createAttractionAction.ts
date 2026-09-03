'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createAttraction } from '@/master/attraction/api/createAttraction'
import { type AttractionFieldErrors, validateAttractionInput } from '@/master/attraction/validation'
import { isForeignKeyViolation, isUniqueViolation } from '@/master/category/db'

export type AttractionFormState = {
    error?: string
    fieldErrors?: AttractionFieldErrors
}

function readString(formData: FormData, key: string) {
    const value = formData.get(key)

    if (typeof value !== 'string') {
        return ''
    }

    return value
}

export async function createAttractionAction(
    _prevState: AttractionFormState,
    formData: FormData
): Promise<AttractionFormState> {
    const result = validateAttractionInput({
        short_name: readString(formData, 'short_name'),
        full_name: readString(formData, 'full_name'),
        slug: readString(formData, 'slug'),
        address: readString(formData, 'address'),
        city_id: readString(formData, 'city_id'),
        category_id: readString(formData, 'category_id'),
        latitude: readString(formData, 'latitude'),
        longitude: readString(formData, 'longitude'),
        entry_fee: readString(formData, 'entry_fee'),
        currency_code: readString(formData, 'currency_code'),
        opening_time: readString(formData, 'opening_time'),
        closing_time: readString(formData, 'closing_time'),
        best_time_to_visit: readString(formData, 'best_time_to_visit'),
        travel_modes: readString(formData, 'travel_modes'),
        short_description: readString(formData, 'short_description'),
        full_description: readString(formData, 'full_description'),
        instructions: readString(formData, 'instructions'),
        status: readString(formData, 'status'),
        is_active: formData.get('is_active') === 'true',
    })

    if (!result.ok) {
        return {
            error: 'Please fix the highlighted fields.',
            fieldErrors: result.errors,
        }
    }

    try {
        await createAttraction(result.values)
    } catch (error) {
        if (isUniqueViolation(error)) {
            return {
                error: 'That slug is already in use. Choose a different one.',
                fieldErrors: { slug: 'That slug is already in use.' },
            }
        }

        if (isForeignKeyViolation(error)) {
            return { error: 'Please choose a valid city and category.' }
        }

        return { error: 'Could not save this attraction. Try again.' }
    }

    revalidatePath('/attraction')
    redirect('/attraction')
}
