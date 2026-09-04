import type { Coords } from '@/site/lib/geo'
import { distanceKm } from '@/site/lib/geo'

/** Position and heading along a polyline, `t` from 0 to 1. */
export function alongPath(
    points: Coords[],
    t: number
): { point: Coords; bearing: number } {
    if (points.length === 0) {
        return { point: { lat: 0, lng: 0 }, bearing: 0 }
    }
    if (points.length === 1) {
        return { point: points[0], bearing: 0 }
    }

    const clamped = Math.min(1, Math.max(0, t))
    const segments: number[] = []
    let total = 0
    for (let i = 1; i < points.length; i++) {
        const length = distanceKm(points[i - 1], points[i])
        segments.push(length)
        total += length
    }

    if (total === 0) {
        return { point: points[0], bearing: bearingBetween(points[0], points[points.length - 1]) }
    }

    let remaining = total * clamped
    for (let i = 0; i < segments.length; i++) {
        const length = segments[i]
        const from = points[i]
        const to = points[i + 1]
        if (remaining <= length || i === segments.length - 1) {
            const ratio = length === 0 ? 0 : Math.min(1, remaining / length)
            return {
                point: {
                    lat: from.lat + (to.lat - from.lat) * ratio,
                    lng: from.lng + (to.lng - from.lng) * ratio,
                },
                bearing: bearingBetween(from, to),
            }
        }
        remaining -= length
    }

    return { point: points[points.length - 1], bearing: 0 }
}

export function bearingBetween(from: Coords, to: Coords): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const dLng = toRad(to.lng - from.lng)
    const lat1 = toRad(from.lat)
    const lat2 = toRad(to.lat)
    const y = Math.sin(dLng) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

/** Google's encoded polyline format. */
export function decodePolyline(encoded: string): Coords[] {
    const points: Coords[] = []
    let index = 0
    let lat = 0
    let lng = 0

    while (index < encoded.length) {
        let result = 0
        let shift = 0
        let byte = 0
        do {
            byte = encoded.charCodeAt(index++) - 63
            result |= (byte & 0x1f) << shift
            shift += 5
        } while (byte >= 0x20)
        lat += result & 1 ? ~(result >> 1) : result >> 1

        result = 0
        shift = 0
        do {
            byte = encoded.charCodeAt(index++) - 63
            result |= (byte & 0x1f) << shift
            shift += 5
        } while (byte >= 0x20)
        lng += result & 1 ? ~(result >> 1) : result >> 1

        points.push({ lat: lat / 1e5, lng: lng / 1e5 })
    }

    return points
}

/** Full length of a polyline in kilometres. */
export function pathLengthKm(points: Coords[]): number {
    let total = 0
    for (let i = 1; i < points.length; i++) {
        total += distanceKm(points[i - 1], points[i])
    }
    return total
}

/** The slice of the polyline from the start up to `t` (0–1). */
export function pathUntil(points: Coords[], t: number): Coords[] {
    const { point } = alongPath(points, t)
    if (points.length < 2) return points.slice()
    const clamped = Math.min(1, Math.max(0, t))
    const total = pathLengthKm(points)
    if (total === 0) return [points[0], point]

    let travelled = 0
    const out: Coords[] = [points[0]]
    for (let i = 1; i < points.length; i++) {
        const segment = distanceKm(points[i - 1], points[i])
        if (travelled + segment >= total * clamped || i === points.length - 1) {
            out.push(point)
            return out
        }
        travelled += segment
        out.push(points[i])
    }
    return out
}

/**
 * Snap a GPS fix onto the nearest point of the road, and report how far
 * along the trip that is (`t` from 0 to 1).
 */
export function nearestOnPath(
    points: Coords[],
    here: Coords
): { t: number; point: Coords; bearing: number; offRouteKm: number } {
    if (points.length === 0) {
        return { t: 0, point: here, bearing: 0, offRouteKm: 0 }
    }
    if (points.length === 1) {
        return {
            t: 0,
            point: points[0],
            bearing: 0,
            offRouteKm: distanceKm(here, points[0]),
        }
    }

    const total = pathLengthKm(points)
    let best = {
        t: 0,
        point: points[0],
        bearing: bearingBetween(points[0], points[1]),
        offRouteKm: distanceKm(here, points[0]),
        along: 0,
    }
    let along = 0

    for (let i = 1; i < points.length; i++) {
        const from = points[i - 1]
        const to = points[i]
        const segment = distanceKm(from, to)
        const projected = projectOnSegment(from, to, here)
        const off = distanceKm(here, projected.point)
        if (off < best.offRouteKm) {
            best = {
                t: total === 0 ? 0 : (along + segment * projected.ratio) / total,
                point: projected.point,
                bearing: bearingBetween(from, to),
                offRouteKm: off,
                along: along + segment * projected.ratio,
            }
        }
        along += segment
    }

    return {
        t: Math.min(1, Math.max(0, best.t)),
        point: best.point,
        bearing: best.bearing,
        offRouteKm: best.offRouteKm,
    }
}

function projectOnSegment(from: Coords, to: Coords, here: Coords): { ratio: number; point: Coords } {
    const dx = to.lng - from.lng
    const dy = to.lat - from.lat
    const length2 = dx * dx + dy * dy
    if (length2 === 0) return { ratio: 0, point: from }
    const ratio = Math.max(
        0,
        Math.min(1, ((here.lng - from.lng) * dx + (here.lat - from.lat) * dy) / length2)
    )
    return {
        ratio,
        point: {
            lat: from.lat + dy * ratio,
            lng: from.lng + dx * ratio,
        },
    }
}
