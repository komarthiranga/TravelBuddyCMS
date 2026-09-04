import { NextRequest, NextResponse } from 'next/server'

import { decodePolyline } from '@/site/lib/alongPath'
import type { DirectionsResult } from '@/site/lib/directions'
import type { Coords } from '@/site/lib/geo'
import type { TravelMode } from '@/site/lib/travelModes'
import {
    fallbackWaypoints,
    kindFromTags,
    mergeLandmarks,
    nameFromTags,
    waypointsFromSteps,
    type OsmStep,
    type RouteWaypoint,
    type WaypointKind,
} from '@/site/lib/waypoints'

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

    const from = { lat: fromLat, lng: fromLng }
    const to = { lat: toLat, lng: toLng }

    const googleKey = process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (googleKey) {
        const google = await fromGoogle(from, to, mode, googleKey)
        if (google) return NextResponse.json(google)
    }

    const osm = await fromOsm(from, to, mode)
    if (osm) return NextResponse.json(osm)

    return NextResponse.json(
        {
            points: [from, to],
            km: 0,
            minutes: 1,
            provider: 'osm',
            waypoints: fallbackWaypoints(200),
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
        routes?: {
            overview_polyline?: { points: string }
            legs?: {
                distance: { value: number }
                duration: { value: number }
                steps?: {
                    distance: { value: number }
                    html_instructions?: string
                    start_location: { lat: number; lng: number }
                    maneuver?: string
                }[]
            }[]
        }[]
    }
    const route = data.status === 'OK' ? data.routes?.[0] : null
    const encoded = route?.overview_polyline?.points
    if (!encoded) return null

    const leg = route?.legs?.[0]
    const points = decodePolyline(encoded)
    const metres = leg?.distance.value ?? 0
    const steps: OsmStep[] = (leg?.steps ?? []).map((step, index, all) => ({
        distance: step.distance.value,
        name: stripHtml(step.html_instructions),
        maneuver: {
            type: index === 0 ? 'depart' : index === all.length - 1 ? 'arrive' : 'turn',
            modifier: step.maneuver,
            location: [step.start_location.lng, step.start_location.lat],
        },
    }))

    return decorate(points, metres, leg?.duration.value ?? 60, 'google', steps)
}

async function fromOsm(
    from: Coords,
    to: Coords,
    mode: TravelMode
): Promise<DirectionsResult | null> {
    const profile = OSRM_PROFILE[mode]
    const url = `https://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`

    const response = await fetch(url, { next: { revalidate: 120 } })
    if (!response.ok) return null
    const data = (await response.json()) as {
        code?: string
        routes?: {
            distance: number
            duration: number
            geometry: { coordinates: [number, number][] }
            legs?: { steps?: OsmStep[] }[]
        }[]
    }
    const route = data.code === 'Ok' ? data.routes?.[0] : null
    if (!route) return null

    const points = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
    const steps = route.legs?.flatMap((leg) => leg.steps ?? []) ?? []
    return decorate(points, route.distance, route.duration, 'osm', steps)
}

async function decorate(
    points: Coords[],
    metres: number,
    seconds: number,
    provider: DirectionsResult['provider'],
    steps: OsmStep[]
): Promise<DirectionsResult> {
    const totalMetres = Math.max(1, Math.round(metres))
    let waypoints: RouteWaypoint[] =
        steps.length > 0
            ? waypointsFromSteps(steps, points, totalMetres)
            : fallbackWaypoints(totalMetres)

    const landmarks = metres < 12000 ? await nearbyLandmarks(points) : []
    if (landmarks.length > 0) {
        waypoints = mergeLandmarks(waypoints, landmarks, points, totalMetres)
    }

    return {
        points,
        km: metres / 1000,
        minutes: Math.max(1, Math.round(seconds / 60)),
        provider,
        waypoints,
    }
}

async function nearbyLandmarks(
    path: Coords[]
): Promise<{ name: string; kind: WaypointKind; coords: Coords }[]> {
    if (path.length === 0) return []
    const lats = path.map((point) => point.lat)
    const lngs = path.map((point) => point.lng)
    const pad = 0.0018
    const south = Math.min(...lats) - pad
    const west = Math.min(...lngs) - pad
    const north = Math.max(...lats) + pad
    const east = Math.max(...lngs) + pad
    const box = `${south},${west},${north},${east}`
    const query = `[out:json][timeout:3];(
      node["highway"="bus_stop"](${box});
      node["public_transport"="platform"](${box});
      node["amenity"="place_of_worship"](${box});
      node["amenity"="school"](${box});
      node["amenity"="hospital"](${box});
      node["amenity"="clinic"](${box});
      node["leisure"="park"](${box});
      node["shop"="convenience"](${box});
      node["shop"="supermarket"](${box});
    );out tags 25;`

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'TravelBuddy/0.1 (local demo)',
            },
            body: `data=${encodeURIComponent(query)}`,
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(2800),
        })
        if (!response.ok) return []
        const data = (await response.json()) as {
            elements?: { lat?: number; lon?: number; tags?: Record<string, string> }[]
        }
        const out: { name: string; kind: WaypointKind; coords: Coords }[] = []
        for (const element of data.elements ?? []) {
            if (element.lat === undefined || element.lon === undefined) continue
            const kind = kindFromTags(element.tags ?? {})
            if (!kind) continue
            out.push({
                name: nameFromTags(element.tags ?? {}, kind),
                kind,
                coords: { lat: element.lat, lng: element.lon },
            })
        }
        return out
    } catch {
        return []
    }
}

function stripHtml(value?: string): string {
    if (!value) return ''
    return value
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}
