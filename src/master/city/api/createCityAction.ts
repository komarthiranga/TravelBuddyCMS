'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createCity } from '@/master/city/api/createCity'
import { type CityFieldErrors, validateCityInput } from '@/master/city/validation'
import { isUniqueViolation } from '@/master/category/db'

export type CreateCityState = {
    error?: string
    fieldErrors?: CityFieldErrors
}

function readString(formData: FormData, key: string) {
    const value = formData.get(key)

    if (typeof value !== 'string') {
        return ''
    }

    return value
}

export async function createCityAction(
    _prevState: CreateCityState,
    formData: FormData
): Promise<CreateCityState> {
    const result = validateCityInput({
        name: readString(formData, 'name'),
        code: readString(formData, 'code'),
        state: readString(formData, 'state'),
        country: readString(formData, 'country'),
        latitude: readString(formData, 'latitude'),
        longitude: readString(formData, 'longitude'),
        is_active: formData.get('is_active') === 'true',
    })

    if (!result.ok) {
        return {
            error: 'Please fix the highlighted fields.',
            fieldErrors: result.errors,
        }
    }

    try {
        await createCity(result.values)
    } catch (error) {
        if (isUniqueViolation(error)) {
            return {
                error: 'That code is already in use. Choose a different one.',
                fieldErrors: { code: 'That code is already in use.' },
            }
        }

        return { error: 'Could not save this city. Try again.' }
    }

    revalidatePath('/city')
    redirect('/city')
}
