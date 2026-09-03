import { ATTRACTION_STATUSES } from '@/master/attraction/types'

export const ATTRACTION_LIMITS = {
    short_name: 150,
    full_name: 300,
    slug: 350,
    best_time_to_visit: 300,
    short_description: 500,
    currency_code: 3,
} as const

export type AttractionInput = {
    short_name: string
    full_name: string
    slug: string
    address: string
    city_id: string
    category_id: string
    latitude: string
    longitude: string
    entry_fee: string
    currency_code: string
    opening_time: string
    closing_time: string
    best_time_to_visit: string
    travel_modes: string
    short_description: string
    full_description: string
    instructions: string
    status: string
    is_active: boolean
}

export type AttractionFieldErrors = {
    short_name?: string
    full_name?: string
    slug?: string
    address?: string
    city_id?: string
    category_id?: string
    latitude?: string
    longitude?: string
    entry_fee?: string
    currency_code?: string
    opening_time?: string
    closing_time?: string
    best_time_to_visit?: string
    short_description?: string
    status?: string
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function parseOptionalCoordinate(value: string, kind: 'latitude' | 'longitude'): {
    value?: string | null
    error?: string
} {
    const trimmed = value.trim()

    if (!trimmed) {
        return { value: null }
    }

    const numeric = Number(trimmed)

    if (!Number.isFinite(numeric)) {
        return { error: `${kind === 'latitude' ? 'Latitude' : 'Longitude'} must be a number.` }
    }

    if (kind === 'latitude' && (numeric < -90 || numeric > 90)) {
        return { error: 'Latitude must be between -90 and 90.' }
    }

    if (kind === 'longitude' && (numeric < -180 || numeric > 180)) {
        return { error: 'Longitude must be between -180 and 180.' }
    }

    return { value: numeric.toFixed(6) }
}

function parseOptionalTime(value: string) {
    const trimmed = value.trim()

    if (!trimmed) {
        return { value: null as string | null }
    }

    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
        return { error: 'Use HH:MM.' }
    }

    return { value: trimmed.length === 5 ? `${trimmed}:00` : trimmed }
}

export function validateAttractionInput(input: AttractionInput) {
    const short_name = input.short_name.trim()
    const full_name = input.full_name.trim()
    const slug = input.slug.trim().toLowerCase().replace(/\s+/g, '-')
    const address = input.address.trim()
    const city_id = Number(input.city_id)
    const category_id = Number(input.category_id)
    const entry_fee_raw = input.entry_fee.trim() || '0'
    const currency_code = input.currency_code.trim().toUpperCase() || 'INR'
    const best_time_to_visit = input.best_time_to_visit.trim()
    const short_description = input.short_description.trim()
    const full_description = input.full_description.trim()
    const instructions = input.instructions.trim()
    const status = input.status.trim().toUpperCase()
    const travel_modes = input.travel_modes
        .split(',')
        .map((mode) => mode.trim())
        .filter(Boolean)

    const errors: AttractionFieldErrors = {}

    if (!short_name) {
        errors.short_name = 'Short name cannot be empty.'
    } else if (short_name.length > ATTRACTION_LIMITS.short_name) {
        errors.short_name = `Short name can be at most ${ATTRACTION_LIMITS.short_name} characters.`
    }

    if (!full_name) {
        errors.full_name = 'Full name cannot be empty.'
    } else if (full_name.length > ATTRACTION_LIMITS.full_name) {
        errors.full_name = `Full name can be at most ${ATTRACTION_LIMITS.full_name} characters.`
    }

    if (!slug) {
        errors.slug = 'Slug cannot be empty.'
    } else if (slug.length > ATTRACTION_LIMITS.slug) {
        errors.slug = `Slug can be at most ${ATTRACTION_LIMITS.slug} characters.`
    } else if (!SLUG_PATTERN.test(slug)) {
        errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens.'
    }

    if (!address) {
        errors.address = 'Address cannot be empty.'
    }

    if (!Number.isInteger(city_id) || city_id < 1) {
        errors.city_id = 'Please choose a city.'
    }

    if (!Number.isInteger(category_id) || category_id < 1) {
        errors.category_id = 'Please choose a category.'
    }

    const latitude = parseOptionalCoordinate(input.latitude, 'latitude')
    const longitude = parseOptionalCoordinate(input.longitude, 'longitude')

    if (latitude.error) {
        errors.latitude = latitude.error
    }

    if (longitude.error) {
        errors.longitude = longitude.error
    }

    const entry_fee = Number(entry_fee_raw)

    if (!Number.isFinite(entry_fee) || entry_fee < 0) {
        errors.entry_fee = 'Entry fee must be 0 or more.'
    }

    if (currency_code.length !== ATTRACTION_LIMITS.currency_code) {
        errors.currency_code = 'Currency must be a 3-letter code, for example INR.'
    }

    const opening_time = parseOptionalTime(input.opening_time)
    const closing_time = parseOptionalTime(input.closing_time)

    if (opening_time.error) {
        errors.opening_time = opening_time.error
    }

    if (closing_time.error) {
        errors.closing_time = closing_time.error
    }

    if (best_time_to_visit.length > ATTRACTION_LIMITS.best_time_to_visit) {
        errors.best_time_to_visit = `Best time can be at most ${ATTRACTION_LIMITS.best_time_to_visit} characters.`
    }

    if (!short_description) {
        errors.short_description = 'Short description cannot be empty.'
    } else if (short_description.length > ATTRACTION_LIMITS.short_description) {
        errors.short_description = `Short description can be at most ${ATTRACTION_LIMITS.short_description} characters.`
    }

    if (!ATTRACTION_STATUSES.includes(status as (typeof ATTRACTION_STATUSES)[number])) {
        errors.status = 'Status must be Draft, Published, or Archived.'
    }

    return {
        values: {
            short_name,
            full_name,
            slug,
            address,
            city_id,
            category_id,
            latitude: latitude.value ?? null,
            longitude: longitude.value ?? null,
            entry_fee: Number.isFinite(entry_fee) ? entry_fee.toFixed(2) : '0.00',
            currency_code,
            opening_time: opening_time.value ?? null,
            closing_time: closing_time.value ?? null,
            best_time_to_visit: best_time_to_visit || null,
            travel_modes,
            short_description,
            full_description: full_description || null,
            instructions: instructions || null,
            status,
            is_active: input.is_active,
        },
        errors,
        ok: Object.keys(errors).length === 0,
    }
}
