export const CITY_LIMITS = {
    name: 150,
    code: 100,
    state: 150,
    country: 150,
} as const

export type CityInput = {
    name: string
    code: string
    state: string
    country: string
    latitude: string
    longitude: string
    is_active: boolean
}

export type CityFieldErrors = {
    name?: string
    code?: string
    state?: string
    country?: string
    latitude?: string
    longitude?: string
}

const CODE_PATTERN = /^[A-Z0-9_]+$/

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

export function normalizeCityInput(input: CityInput) {
    return {
        name: input.name.trim(),
        code: input.code.trim().toUpperCase().replace(/\s+/g, '_'),
        state: input.state.trim(),
        country: input.country.trim(),
        latitude: input.latitude.trim(),
        longitude: input.longitude.trim(),
        is_active: input.is_active,
    }
}

export function validateCityInput(input: CityInput) {
    const values = normalizeCityInput(input)
    const errors: CityFieldErrors = {}

    if (!values.name) {
        errors.name = 'Name cannot be empty.'
    } else if (values.name.length > CITY_LIMITS.name) {
        errors.name = `Name can be at most ${CITY_LIMITS.name} characters.`
    }

    if (!values.code) {
        errors.code = 'Code cannot be empty.'
    } else if (values.code.length > CITY_LIMITS.code) {
        errors.code = `Code can be at most ${CITY_LIMITS.code} characters.`
    } else if (!CODE_PATTERN.test(values.code)) {
        errors.code = 'Code can only contain letters, numbers, and underscores.'
    }

    if (!values.state) {
        errors.state = 'State cannot be empty.'
    } else if (values.state.length > CITY_LIMITS.state) {
        errors.state = `State can be at most ${CITY_LIMITS.state} characters.`
    }

    if (!values.country) {
        errors.country = 'Country cannot be empty.'
    } else if (values.country.length > CITY_LIMITS.country) {
        errors.country = `Country can be at most ${CITY_LIMITS.country} characters.`
    }

    const latitudeResult = parseOptionalCoordinate(values.latitude, 'latitude')
    const longitudeResult = parseOptionalCoordinate(values.longitude, 'longitude')

    if (latitudeResult.error) {
        errors.latitude = latitudeResult.error
    }

    if (longitudeResult.error) {
        errors.longitude = longitudeResult.error
    }

    return {
        values: {
            name: values.name,
            code: values.code,
            state: values.state,
            country: values.country,
            latitude: latitudeResult.value ?? null,
            longitude: longitudeResult.value ?? null,
            is_active: values.is_active,
        },
        errors,
        ok: Object.keys(errors).length === 0,
    }
}
