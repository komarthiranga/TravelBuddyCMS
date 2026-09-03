export const ATTRACTION_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const

export type AttractionStatus = (typeof ATTRACTION_STATUSES)[number]

export type attractionListItem = {
    id: number
    short_name: string
    slug: string
    city_name: string
    category_name: string
    status: string
    is_active: boolean
    updated_at: string
}

export type attraction = {
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
    opening_time: string | null
    closing_time: string | null
    best_time_to_visit: string | null
    travel_modes: string[]
    short_description: string
    full_description: string | null
    instructions: string | null
    status: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export type SelectOption = {
    id: number
    name: string
}
