import { alongPath, nearestOnPath, pathLengthKm } from '@/site/lib/alongPath'
import type { Coords } from '@/site/lib/geo'

export type WaypointKind =
    | 'start'
    | 'bus'
    | 'temple'
    | 'school'
    | 'hospital'
    | 'shop'
    | 'park'
    | 'turn'
    | 'road'
    | 'end'

export type RouteWaypoint = {
    id: string
    name: string
    kind: WaypointKind
    /** Metres from the start of the trip. */
    metres: number
    /** Metres from the previous pointer. */
    metresFromPrev: number
}

export type OsmStep = {
    distance: number
    name?: string
    maneuver?: {
        type?: string
        modifier?: string
        location?: [number, number]
    }
}

const MAX_POINTS = 8
const MIN_GAP_M = 70

export function formatMetres(metres: number): string {
    if (metres < 950) return `${Math.max(50, Math.round(metres / 50) * 50)} m`
    const km = metres / 1000
    if (km < 10) return `${km.toFixed(1)} km`
    return `${Math.round(km)} km`
}

export function waypointsFromSteps(
    steps: OsmStep[],
    path: Coords[],
    totalMetres: number
): RouteWaypoint[] {
    const drafted: Omit<RouteWaypoint, 'metresFromPrev'>[] = []
    let along = 0

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        const type = step.maneuver?.type ?? ''
        const location = step.maneuver?.location
        const coords = location
            ? { lat: location[1], lng: location[0] }
            : alongPathMetres(path, along)

        const metres = clampMetres(coords, path, along)
        const kind = kindFromStep(type, step.maneuver?.modifier, step.name)
        const name = labelFromStep(type, step.maneuver?.modifier, step.name)

        if (type === 'depart') {
            drafted.push({ id: 'start', name: 'Where you are', kind: 'start', metres: 0 })
        } else if (type === 'arrive') {
            drafted.push({
                id: 'end',
                name: 'The place',
                kind: 'end',
                metres: totalMetres || metres,
            })
        } else if (name) {
            const previous = drafted[drafted.length - 1]
            if (!previous || metres - previous.metres >= MIN_GAP_M) {
                drafted.push({
                    id: `step-${i}`,
                    name,
                    kind,
                    metres,
                })
            }
        }

        along += step.distance || 0
    }

    if (drafted.length === 0) {
        return withGaps([
            { id: 'start', name: 'Where you are', kind: 'start', metres: 0 },
            { id: 'end', name: 'The place', kind: 'end', metres: totalMetres },
        ])
    }

    return withGaps(fillTicks(thin(dedupe(drafted), totalMetres), totalMetres))
}

export function mergeLandmarks(
    base: RouteWaypoint[],
    landmarks: { name: string; kind: WaypointKind; coords: Coords }[],
    path: Coords[],
    totalMetres: number
): RouteWaypoint[] {
    const extra: Omit<RouteWaypoint, 'metresFromPrev'>[] = base.map(
        ({ metresFromPrev: _ignored, ...rest }) => rest
    )

    for (const [index, landmark] of landmarks.entries()) {
        const snap = nearestOnPath(path, landmark.coords)
        if (snap.offRouteKm > 0.13) continue
        const metres = Math.round(snap.t * totalMetres)
        if (metres < MIN_GAP_M || metres > totalMetres - MIN_GAP_M) continue
        extra.push({
            id: `poi-${index}`,
            name: landmark.name,
            kind: landmark.kind,
            metres,
        })
    }

    extra.sort((a, b) => a.metres - b.metres)
    return withGaps(fillTicks(thin(dedupe(extra), totalMetres), totalMetres))
}

export function fallbackWaypoints(totalMetres: number): RouteWaypoint[] {
    const drafted: Omit<RouteWaypoint, 'metresFromPrev'>[] = [
        { id: 'start', name: 'Where you are', kind: 'start', metres: 0 },
    ]
    const ticks = totalMetres > 1800 ? [0.25, 0.5, 0.75] : totalMetres > 250 ? [0.4] : []
    for (const [index, ratio] of ticks.entries()) {
        drafted.push({
            id: `tick-${index}`,
            name: 'Keep going',
            kind: 'road',
            metres: Math.round(totalMetres * ratio),
        })
    }
    drafted.push({ id: 'end', name: 'The place', kind: 'end', metres: totalMetres })
    return withGaps(drafted)
}

function kindFromStep(type: string, modifier?: string, name?: string): WaypointKind {
    if (type === 'depart') return 'start'
    if (type === 'arrive') return 'end'
    if (type === 'turn' || type === 'end of road' || type === 'fork' || type === 'rotary') {
        return 'turn'
    }
    if (name) return 'road'
    return modifier ? 'turn' : 'road'
}

function labelFromStep(type: string, modifier?: string, name?: string): string {
    const road = tidyName(name)
    if (type === 'depart') return 'Where you are'
    if (type === 'arrive') return 'The place'
    if (type === 'turn') {
        const dir =
            modifier === 'left' || modifier === 'sharp left' || modifier === 'slight left'
                ? 'Left'
                : modifier === 'right' || modifier === 'sharp right' || modifier === 'slight right'
                  ? 'Right'
                  : 'Turn'
        return road ? `${dir} onto ${road}` : `${dir} turn`
    }
    if (type === 'end of road' && road) return `Onto ${road}`
    if (type === 'new name' && road) return road
    if (type === 'continue' && road) return road
    return road
}

function tidyName(name?: string): string {
    const trimmed = name?.trim()
    if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'unnamed road') return ''
    return trimmed.replace(/\s+/g, ' ')
}

function alongPathMetres(path: Coords[], metres: number): Coords {
    const total = pathLengthKm(path) * 1000
    const t = total === 0 ? 0 : metres / total
    return alongPath(path, t).point
}

function clampMetres(coords: Coords, path: Coords[], fallback: number): number {
    if (path.length < 2) return Math.round(fallback)
    const total = pathLengthKm(path) * 1000
    if (total === 0) return Math.round(fallback)
    return Math.round(nearestOnPath(path, coords).t * total)
}

function dedupe(points: Omit<RouteWaypoint, 'metresFromPrev'>[]) {
    const out: typeof points = []
    for (const point of points) {
        const previous = out[out.length - 1]
        if (previous && Math.abs(previous.metres - point.metres) < MIN_GAP_M) {
            if (rank(point.kind) > rank(previous.kind)) out[out.length - 1] = point
            continue
        }
        out.push(point)
    }
    return out
}

function thin(
    points: Omit<RouteWaypoint, 'metresFromPrev'>[],
    totalMetres: number
): Omit<RouteWaypoint, 'metresFromPrev'>[] {
    const sorted = [...points].sort((a, b) => a.metres - b.metres)
    if (sorted.length <= MAX_POINTS) return sorted

    const start = sorted[0]
    const end = sorted[sorted.length - 1]
    const middle = sorted.slice(1, -1)
    const landmarks = middle.filter((point) => rank(point.kind) >= 3)
    const filler = middle.filter((point) => rank(point.kind) < 3)
    const keep = [...landmarks]
    const slots = Math.max(0, MAX_POINTS - 2 - keep.length)

    if (slots > 0 && filler.length > 0) {
        const step = filler.length / (slots + 1)
        for (let i = 1; i <= slots; i++) {
            const pick = filler[Math.min(filler.length - 1, Math.round(i * step) - 1)]
            if (pick && !keep.some((item) => item.id === pick.id)) keep.push(pick)
        }
    }

    keep.sort((a, b) => a.metres - b.metres)
    const combined = dedupe([start, ...keep, { ...end, metres: totalMetres || end.metres }])
    return combined.length >= 2 ? combined : sorted.slice(0, MAX_POINTS)
}

function fillTicks(
    points: Omit<RouteWaypoint, 'metresFromPrev'>[],
    totalMetres: number
): Omit<RouteWaypoint, 'metresFromPrev'>[] {
    if (points.length === 0) return points
    const out: typeof points = [points[0]]
    for (let i = 1; i < points.length; i++) {
        const previous = out[out.length - 1]
        const current = points[i]
        const gap = current.metres - previous.metres
        if (gap >= 220 && out.length + (points.length - i) < MAX_POINTS) {
            out.push({
                id: `tick-${previous.id}-${current.id}`,
                name: 'Keep going',
                kind: 'road',
                metres: previous.metres + Math.round(gap / 2),
            })
        }
        out.push(current)
    }
    if (out.length === 2 && totalMetres > 180) {
        out.splice(1, 0, {
            id: 'tick-mid',
            name: 'Keep going',
            kind: 'road',
            metres: Math.round(totalMetres / 2),
        })
    }
    return out
}

function withGaps(points: Omit<RouteWaypoint, 'metresFromPrev'>[]): RouteWaypoint[] {
    return points.map((point, index) => ({
        ...point,
        metresFromPrev: index === 0 ? 0 : Math.max(0, point.metres - points[index - 1].metres),
    }))
}

function rank(kind: WaypointKind): number {
    if (kind === 'start' || kind === 'end') return 5
    if (kind === 'bus' || kind === 'temple') return 4
    if (kind === 'school' || kind === 'hospital' || kind === 'park' || kind === 'shop') return 3
    if (kind === 'turn') return 2
    return 1
}

export function kindFromTags(tags: Record<string, string | undefined>): WaypointKind | null {
    if (tags.highway === 'bus_stop' || tags.public_transport === 'platform') return 'bus'
    if (tags.amenity === 'place_of_worship') return 'temple'
    if (tags.amenity === 'school' || tags.amenity === 'college') return 'school'
    if (tags.amenity === 'hospital' || tags.amenity === 'clinic') return 'hospital'
    if (tags.leisure === 'park' || tags.leisure === 'garden') return 'park'
    if (tags.shop || tags.amenity === 'marketplace') return 'shop'
    return null
}

export function nameFromTags(
    tags: Record<string, string | undefined>,
    kind: WaypointKind
): string {
    const named = tags.name?.trim()
    if (named) return named
    if (kind === 'bus') return 'Bus stand'
    if (kind === 'temple') return 'Temple'
    if (kind === 'school') return 'School'
    if (kind === 'hospital') return 'Hospital'
    if (kind === 'park') return 'Park'
    if (kind === 'shop') return 'Shop'
    return 'Landmark'
}
