export type Coords = { lat: number; lng: number }

const EARTH_RADIUS_KM = 6371

/** Great-circle distance in kilometres. */
export function distanceKm(from: Coords, to: Coords): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const dLat = toRad(to.lat - from.lat)
    const dLng = toRad(to.lng - from.lng)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

/**
 * Parses the numeric strings Postgres returns for `numeric` columns.
 * Returns null when either value is missing or unparseable.
 */
export function toCoords(
    lat: string | number | null | undefined,
    lng: string | number | null | undefined
): Coords | null {
    if (lat === null || lat === undefined || lng === null || lng === undefined) return null
    const parsedLat = typeof lat === 'number' ? lat : Number.parseFloat(lat)
    const parsedLng = typeof lng === 'number' ? lng : Number.parseFloat(lng)
    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return null
    return { lat: parsedLat, lng: parsedLng }
}

export function formatDistance(km: number): string {
    if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`
    if (km < 10) return `${km.toFixed(1)} km`
    return `${Math.round(km)} km`
}

const WALK_KMH = 4.5
const ROAD_KMH = 34

/**
 * A deliberately rough travel estimate — enough to plan around, and always
 * prefixed with "about" in the UI so it never reads as a promise.
 */
export function estimateTravel(km: number): { minutes: number; mode: 'walk' | 'drive' } {
    const mode = km <= 1.2 ? 'walk' : 'drive'
    const speed = mode === 'walk' ? WALK_KMH : ROAD_KMH
    return { minutes: Math.max(1, Math.round((km / speed) * 60)), mode }
}

export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    if (rest === 0) return `${hours} hr`
    return `${hours} hr ${rest} min`
}

/** Human summary such as "about 25 min drive". */
export function travelSummary(km: number): string {
    const { minutes, mode } = estimateTravel(km)
    return `about ${formatDuration(minutes)} ${mode}`
}

export function nearest<T>(
    from: Coords,
    items: readonly T[],
    getCoords: (item: T) => Coords | null
): { item: T; km: number } | null {
    let best: { item: T; km: number } | null = null
    for (const item of items) {
        const coords = getCoords(item)
        if (!coords) continue
        const km = distanceKm(from, coords)
        if (!best || km < best.km) best = { item, km }
    }
    return best
}
