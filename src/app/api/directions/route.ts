import { NextRequest, NextResponse } from 'next/server'

import { decodePolyline } from '@/site/lib/alongPath'
import type { DirectionsResult } from '@/site/lib/directions'
import type { Coords } from '@/site/lib/geo'
import type { TravelMode } from '@/site/lib/travelModes'

const MODES: TravelMode[] = ['walk', 'cycle', 'auto', 'bus', 'car']

const OSRM_PROFILE: Record<TravelMode, string> = {
    walk: 'foot',
    cycle: 'bike',
    auto: 'driving',
    bus: 'driving',
    car: 'driving',
}

const GOOGLE_MODE: Record<TravelMode, string> = {
    walk: 'walking',
    cycle: 'bicycling',
    auto: 'driving',
    bus: 'transit',
    car: 'driving',
}

function readCoord(value: string | null): number | null {
    if (!value) return null
    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed) || Math.abs(parsed) > 180) return null
    return parsed
}

export async function GET(request: NextRequest) {
    const fromLat = readCoord(request.nextUrl.searchParams.get('fromLat'))
    const fromLng = readCoord(request.nextUrl.searchParams.get('fromLng'))
    const toLat = readCoord(request.nextUrl.searchParams.get('toLat'))
    const toLng = readCoord(request.nextUrl.searchParams.get('toLng'))
    const rawMode = request.nextUrl.searchParams.get('mode') ?? 'auto'
    const mode = MODES.includes(rawMode as TravelMode) ? (rawMode as TravelMode) : 'auto'

    if (fromLat === null || fromLng === null || toLat === null || toLng === null) {
        return NextResponse.json({ error: 'Need from and to coordinates.' }, { status: 400 })
    }

    const googleKey = process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (googleKey) {
        const google = await fromGoogle(
            { lat: fromLat, lng: fromLng },
            { lat: toLat, lng: toLng },
            mode,
            googleKey
        )
        if (google) return NextResponse.json(google)
    }

    const osm = await fromOsm(
        { lat: fromLat, lng: fromLng },
        { lat: toLat, lng: toLng },
        mode
    )
    if (osm) return NextResponse.json(osm)

    return NextResponse.json(
        {
            points: [
                { lat: fromLat, lng: fromLng },
                { lat: toLat, lng: toLng },
            ],
            km: 0,
            minutes: 1,
            provider: 'osm',
        } satisfies DirectionsResult,
        { status: 200 }
    )
}

async function fromGoogle(
    from: Coords,
    to: Coords,
    mode: TravelMode,
    key: string
): Promise<DirectionsResult | null> {
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json')
    url.searchParams.set('origin', `${from.lat},${from.lng}`)
    url.searchParams.set('destination', `${to.lat},${to.lng}`)
    url.searchParams.set('mode', GOOGLE_MODE[mode])
    url.searchParams.set('key', key)

    const response = await fetch(url, { next: { revalidate: 120 } })
    if (!response.ok) return null
    const data = (await response.json()) as {
        status: string
        routes?: { overview_polyline?: { points: string }; legs?: { distance: { value: number }; duration: { value: number } }[] }[]
    }
    const route = data.status === 'OK' ? data.routes?.[0] : null
    const encoded = route?.overview_polyline?.points
    if (!encoded) return null

    const leg = route?.legs?.[0]
    return {
        points: decodePolyline(encoded),
        km: (leg?.distance.value ?? 0) / 1000,
        minutes: Math.max(1, Math.round((leg?.duration.value ?? 60) / 60)),
        provider: 'google',
    }
}

async function fromOsm(from: Coords, to: Coords, mode: TravelMode): Promise<DirectionsResult | null> {
    const profile = OSRM_PROFILE[mode]
    const url = `https://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`

    const response = await fetch(url, { next: { revalidate: 120 } })
    if (!response.ok) return null
    const data = (await response.json()) as {
        code?: string
        routes?: {
            distance: number
            duration: number
            geometry: { coordinates: [number, number][] }
        }[]
    }
    const route = data.code === 'Ok' ? data.routes?.[0] : null
    if (!route) return null

    return {
        points: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
        km: route.distance / 1000,
        minutes: Math.max(1, Math.round(route.duration / 60)),
        provider: 'osm',
    }
}
