import type { Coords } from '@/site/lib/geo'
import type { TravelMode } from '@/site/lib/travelModes'

export function googleMapsSearchUrl(destination: Coords, fallbackQuery: string) {
    const query = `${destination.lat},${destination.lng}`
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || fallbackQuery)}`
}

export function googleMapsDirUrl(origin: Coords, destination: Coords, mode: TravelMode) {
    const params = new URLSearchParams({
        api: '1',
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        travelmode: mapsTravelMode(mode),
    })
    return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function mapsTravelMode(mode: TravelMode): 'driving' | 'walking' | 'bicycling' | 'transit' {
    if (mode === 'walk') return 'walking'
    if (mode === 'cycle') return 'bicycling'
    if (mode === 'bus') return 'transit'
    return 'driving'
}

export function recommendMode(km: number): TravelMode {
    if (km <= 1.2) return 'walk'
    if (km <= 4) return 'auto'
    if (km <= 12) return 'bus'
    return 'car'
}
