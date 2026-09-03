import type { attraction } from '@/master/attraction/types'

function toIsoString(value: Date | string) {
    if (value instanceof Date) {
        return value.toISOString()
    }

    return value
}

function toTimeValue(value: string | Date | null | undefined) {
    if (!value) {
        return null
    }

    if (value instanceof Date) {
        const hours = String(value.getHours()).padStart(2, '0')
        const minutes = String(value.getMinutes()).padStart(2, '0')
        const seconds = String(value.getSeconds()).padStart(2, '0')
        return `${hours}:${minutes}:${seconds}`
    }

    return String(value)
}

export function serializeAttraction(row: {
    id: number
    short_name: string
    full_name: string
    slug: string
    address: string
    city_id: number
    category_id: number
    city_name: string
    category_name: string
    latitude: string | null
    longitude: string | null
    entry_fee: string
    currency_code: string
    opening_time: string | Date | null
    closing_time: string | Date | null
    best_time_to_visit: string | null
    travel_modes: string[] | null
    short_description: string
    full_description: string | null
    instructions: string | null
    status: string
    is_active: boolean
    created_at: Date | string
    updated_at: Date | string
}): attraction {
    return {
        id: row.id,
        short_name: row.short_name,
        full_name: row.full_name,
        slug: row.slug,
        address: row.address,
        city_id: row.city_id,
        category_id: row.category_id,
        city_name: row.city_name,
        category_name: row.category_name,
        latitude: row.latitude,
        longitude: row.longitude,
        entry_fee: row.entry_fee,
        currency_code: row.currency_code,
        opening_time: toTimeValue(row.opening_time),
        closing_time: toTimeValue(row.closing_time),
        best_time_to_visit: row.best_time_to_visit,
        travel_modes: row.travel_modes ?? [],
        short_description: row.short_description,
        full_description: row.full_description,
        instructions: row.instructions,
        status: row.status,
        is_active: row.is_active,
        created_at: toIsoString(row.created_at),
        updated_at: toIsoString(row.updated_at),
    }
}

export function toTimeInput(value: string | null) {
    if (!value) {
        return ''
    }

    return value.slice(0, 5)
}
