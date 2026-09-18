export const categories = [
    { id: 'attractions', label: 'Explore', type: 'tourist_attraction', title: 'Find your next little adventure', hint: 'Landmarks, sights and places worth exploring.' },
    { id: 'hotels', label: 'Stay', type: 'lodging', title: 'Find a place to feel at home', hint: 'Discover hotels and stays. Check room rates with the property.' },
    { id: 'food', label: 'Eat', type: 'restaurant', title: 'Find your next favourite bite', hint: 'Restaurants and local food, straight from online listings.' },
    { id: 'transport', label: 'Travel', type: 'transit_station', title: 'Find your way around', hint: 'Stations and transport stops near your destination.' },
    { id: 'essentials', label: 'Essentials', type: 'supermarket', title: 'Everyday needs, close by', hint: 'Groceries, pharmacies, ATMs and everyday stops.' },
    { id: 'services', label: 'Local services', type: 'hospital', title: 'Find local help', hint: 'Hospitals, pharmacies and public services.' },
] as const
export type Category = typeof categories[number]['id']
export const searchTypes: Record<Category, readonly string[]> = {
    attractions: ['tourist_attraction', 'museum', 'park', 'hindu_temple', 'art_gallery'],
    hotels: ['lodging', 'hotel', 'guest_house', 'hostel'],
    food: ['restaurant', 'cafe', 'bakery', 'vegetarian_restaurant'],
    transport: ['transit_station', 'bus_station', 'train_station', 'airport'],
    essentials: ['supermarket', 'pharmacy', 'atm', 'gas_station', 'shopping_mall'],
    services: ['hospital', 'pharmacy', 'police', 'post_office', 'bank'],
}
export const validPlaceId = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9_-]{5,255}$/.test(id)
export type City = { id: string; name: string; address: string }
export type Position = { latitude: number; longitude: number }
export function validPosition(value: unknown): value is Position {
    if (!value || typeof value !== 'object') return false
    const p = value as Position
    return typeof p.latitude === 'number' && Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90 && typeof p.longitude === 'number' && Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180
}
export type Attribution = { name: string; url: string | null }
export type OnlinePlace = {
    id: string; name: string; address: string; type: string; types: string[]; mapsUrl: string | null
    rating?: number; reviews?: number; hours?: string[]; open?: boolean; phone?: string; website?: string | null
    priceLevel?: string; businessStatus?: string; photo?: { name: string; authors: Attribution[] }
    attributions: Attribution[]
    distanceKm?: number
}
export type UserPlace = { place_id: string; saved: boolean; liked: boolean }
export function safeHttps(value: unknown): string | null {
    if (typeof value !== 'string') return null
    try { const url = new URL(value.startsWith('//') ? `https:${value}` : value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null } catch { return null }
}
export const typeLabel = (type: string) => type.replaceAll('_', ' ').replace(/^./, s => s.toUpperCase())
