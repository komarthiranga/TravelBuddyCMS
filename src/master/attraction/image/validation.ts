export const IMAGE_LIMITS = {
    public_id: 300,
    alt_text: 300,
} as const

export type AttractionImageInput = {
    attraction_id: string
    image_url: string
    public_id: string
    alt_text: string
    display_order: string
    is_primary: boolean
}

export type AttractionImageFieldErrors = {
    attraction_id?: string
    image_url?: string
    public_id?: string
    alt_text?: string
    display_order?: string
}

export function validateAttractionImageInput(input: AttractionImageInput) {
    const attraction_id = Number(input.attraction_id)
    const image_url = input.image_url.trim()
    const public_id = input.public_id.trim()
    const alt_text = input.alt_text.trim()
    const display_order = Number(input.display_order.trim() || '0')
    const errors: AttractionImageFieldErrors = {}

    if (!Number.isInteger(attraction_id) || attraction_id < 1) {
        errors.attraction_id = 'Attraction is missing.'
    }

    if (!image_url) {
        errors.image_url = 'Image URL cannot be empty.'
    } else if (!/^https?:\/\//i.test(image_url)) {
        errors.image_url = 'Image URL must start with http:// or https://.'
    }

    if (!public_id) {
        errors.public_id = 'Public ID cannot be empty.'
    } else if (public_id.length > IMAGE_LIMITS.public_id) {
        errors.public_id = `Public ID can be at most ${IMAGE_LIMITS.public_id} characters.`
    }

    if (alt_text.length > IMAGE_LIMITS.alt_text) {
        errors.alt_text = `Alt text can be at most ${IMAGE_LIMITS.alt_text} characters.`
    }

    if (!Number.isInteger(display_order) || display_order < 0) {
        errors.display_order = 'Display order must be 0 or more.'
    }

    return {
        values: {
            attraction_id,
            image_url,
            public_id,
            alt_text: alt_text || null,
            display_order,
            is_primary: input.is_primary,
        },
        errors,
        ok: Object.keys(errors).length === 0,
    }
}
