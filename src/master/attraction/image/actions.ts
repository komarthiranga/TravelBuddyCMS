'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createAttractionImage, updateAttractionImage } from '@/master/attraction/image/api'
import { type AttractionImageFieldErrors, validateAttractionImageInput } from '@/master/attraction/image/validation'
import { isForeignKeyViolation, isUniqueViolation } from '@/master/category/db'

export type AttractionImageFormState = {
    error?: string
    fieldErrors?: AttractionImageFieldErrors
}

function readString(formData: FormData, key: string) {
    const value = formData.get(key)

    if (typeof value !== 'string') {
        return ''
    }

    return value
}

export async function createAttractionImageAction(
    _prevState: AttractionImageFormState,
    formData: FormData
): Promise<AttractionImageFormState> {
    const result = validateAttractionImageInput({
        attraction_id: readString(formData, 'attraction_id'),
        image_url: readString(formData, 'image_url'),
        public_id: readString(formData, 'public_id'),
        alt_text: readString(formData, 'alt_text'),
        display_order: readString(formData, 'display_order'),
        is_primary: formData.get('is_primary') === 'true',
    })

    if (!result.ok) {
        return {
            error: 'Please fix the highlighted fields.',
            fieldErrors: result.errors,
        }
    }

    try {
        await createAttractionImage(result.values)
    } catch (error) {
        if (isUniqueViolation(error)) {
            return {
                error: 'That public ID is already in use.',
                fieldErrors: { public_id: 'That public ID is already in use.' },
            }
        }

        if (isForeignKeyViolation(error)) {
            return { error: 'This attraction could not be found.' }
        }

        return { error: 'Could not save this image. Try again.' }
    }

    revalidatePath(`/attraction/${result.values.attraction_id}`)
    redirect(`/attraction/${result.values.attraction_id}`)
}

export async function updateAttractionImageAction(
    _prevState: AttractionImageFormState,
    formData: FormData
): Promise<AttractionImageFormState> {
    const id = Number(readString(formData, 'id'))

    if (!Number.isInteger(id) || id < 1) {
        return { error: 'This image could not be updated.' }
    }

    const result = validateAttractionImageInput({
        attraction_id: readString(formData, 'attraction_id'),
        image_url: readString(formData, 'image_url'),
        public_id: readString(formData, 'public_id'),
        alt_text: readString(formData, 'alt_text'),
        display_order: readString(formData, 'display_order'),
        is_primary: formData.get('is_primary') === 'true',
    })

    if (!result.ok) {
        return {
            error: 'Please fix the highlighted fields.',
            fieldErrors: result.errors,
        }
    }

    try {
        await updateAttractionImage(id, result.values)
    } catch (error) {
        if (isUniqueViolation(error)) {
            return {
                error: 'That public ID is already in use.',
                fieldErrors: { public_id: 'That public ID is already in use.' },
            }
        }

        return { error: 'Could not save this image. Try again.' }
    }

    revalidatePath(`/attraction/${result.values.attraction_id}`)
    redirect(`/attraction/${result.values.attraction_id}`)
}
