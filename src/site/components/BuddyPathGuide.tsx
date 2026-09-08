'use client'

import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Flag, LoaderCircle, MapPin, Navigation } from 'lucide-react'

import { BuddyMascot } from '@/site/components/BuddyMascot'
import type { DirectionsResult } from '@/site/lib/directions'
import type { Coords } from '@/site/lib/geo'
import { formatDistance, formatDuration } from '@/site/lib/geo'
import { TRAVEL_MODES, type TravelMode } from '@/site/lib/travelModes'
import {
    fallbackWaypoints,
    formatMetres,
    type RouteWaypoint,
} from '@/site/lib/waypoints'

const HOW: Record<TravelMode, string> = {
    walk: 'walking',
    cycle: 'by cycle',
    auto: 'by auto',
    bus: 'by bus',
    car: 'by car',
}

function labelWaypoints(
    waypoints: RouteWaypoint[],
    destinationName: string,
    startName: string
): RouteWaypoint[] {
    return waypoints.map((point, index) => {
        if (index === 0) return { ...point, name: startName }
        if (index === waypoints.length - 1) {
            return { ...point, name: destinationName, kind: 'end' }
        }
        return point
    })
}

export function BuddyPathGuide({
    origin,
    destination,
    destinationName,
    mode,
    onDone,
    startName = 'Where you are now',
    doneLabel = 'I have the way. Thanks',
    className = '',
}: {
    origin: Coords
    destination: Coords
    destinationName: string
    mode: TravelMode
    onDone: () => void
    startName?: string
    doneLabel?: string
    className?: string
}) {
    const [route, setRoute] = useState<DirectionsResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const params = new URLSearchParams({
            fromLat: String(origin.lat),
            fromLng: String(origin.lng),
            toLat: String(destination.lat),
            toLng: String(destination.lng),
            mode,
        })
        let cancelled = false
        fetch(`/api/directions?${params}`)
            .then((response) => {
                if (!response.ok) throw new Error('Could not fetch a route')
                return response.json() as Promise<DirectionsResult>
            })
            .then((data) => {
                if (!cancelled) setRoute(data)
            })
            .catch(() => {
                if (!cancelled) {
                    setError("I couldn't name every turn. The distance is still right.")
                    setRoute({
                        points: [origin, destination],
                        km: 0,
                        minutes: 1,
                        provider: 'osm',
                        waypoints: fallbackWaypoints(400),
                    })
                }
            })
        return () => {
            cancelled = true
        }
    }, [origin.lat, origin.lng, destination.lat, destination.lng, mode])

    const waypoints = labelWaypoints(
        route?.waypoints?.length ? route.waypoints : fallbackWaypoints(400),
        destinationName,
        startName
    )
    const loading = !route
    const how = HOW[mode]
    const Icon = TRAVEL_MODES[mode].icon
    const minutes = route
        ? Math.max(1, Math.round(((route.km || 0.4) / TRAVEL_MODES[mode].kmh) * 60))
        : null

    return (
        <div className={`flex h-full min-h-0 flex-col bg-cream text-ink ${className}`}>
            <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 sm:px-6">
                <header className="flex shrink-0 items-end gap-3 sm:gap-5">
                    <BuddyMascot
                        pose="point"
                        title="Your local buddy"
                        className="h-24 w-auto shrink-0 sm:h-32"
                    />
                    <div className="min-w-0 pb-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-brand-dark">
                            The way there
                        </p>
                        <h2 className="mt-1 font-display text-2xl leading-tight sm:text-3xl">
                            Here is how you reach {destinationName}
                        </h2>
                    </div>
                </header>

                <div className="mt-5 grid shrink-0 grid-cols-3 gap-2">
                    <Fact
                        label="How far"
                        value={loading ? '…' : formatDistance(route.km || 0.4)}
                    />
                    <Fact
                        label="How long"
                        value={minutes === null ? '…' : `about ${formatDuration(minutes)}`}
                    />
                    <Fact
                        label="How"
                        value={TRAVEL_MODES[mode].label}
                        icon={<Icon className="size-4" aria-hidden="true" />}
                    />
                </div>

                <div className="mt-4 flex shrink-0 items-center gap-2 rounded-2xl border border-hairline bg-white px-3 py-3 sm:px-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                        You
                    </span>
                    <span className="h-0.5 min-w-0 flex-1 rounded-full bg-amber-brand" aria-hidden="true" />
                    <span className="shrink-0 text-center text-xs font-semibold leading-tight text-ink-soft">
                        {loading ? '…' : formatDistance(route.km || 0.4)}
                        {!loading && waypoints.length > 2 && (
                            <span className="mt-0.5 block text-[10px] font-medium text-ink-soft/70">
                                {waypoints.length - 2} stops on the way
                            </span>
                        )}
                    </span>
                    <span className="h-0.5 min-w-0 flex-1 rounded-full bg-amber-brand" aria-hidden="true" />
                    <span className="flex max-w-[42%] items-center justify-center rounded-full bg-amber-brand px-2.5 py-1.5 text-center text-[10px] font-bold leading-tight text-ink sm:max-w-none sm:text-xs">
                        {destinationName}
                    </span>
                </div>

                <p className="mt-4 shrink-0 rounded-2xl bg-ink px-4 py-3 text-sm leading-relaxed text-white">
                    Start from where you are. Follow the stops below, one after another — like a
                    bus route. Last stop is {destinationName}.
                </p>

                <ol className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-[1.5rem] border border-hairline bg-white px-4 py-2 sm:px-5">
                    {loading ? (
                        <li className="flex items-center gap-3 py-8 text-sm text-ink-soft">
                            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                            Writing down the turns…
                        </li>
                    ) : (
                        waypoints.map((point, index) => {
                            const last = index === waypoints.length - 1
                            const next = waypoints[index + 1]
                            return (
                                <Fragment key={point.id}>
                                    <PathStop
                                        point={point}
                                        index={index}
                                        last={last}
                                        how={how}
                                    />
                                    {!last && next && (
                                        <li
                                            aria-hidden="true"
                                            className="flex items-center gap-3.5 py-0.5"
                                        >
                                            <span className="flex w-8 shrink-0 justify-center">
                                                <span className="h-7 w-0.5 rounded-full bg-amber-brand/50" />
                                            </span>
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft/70">
                                                {formatMetres(next.metresFromPrev)}
                                            </span>
                                        </li>
                                    )}
                                </Fragment>
                            )
                        })
                    )}
                </ol>

                {error && (
                    <p className="mt-3 shrink-0 text-center text-sm text-amber-brand-dark">{error}</p>
                )}

                <button
                    type="button"
                    onClick={onDone}
                    className="mt-4 inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-amber-brand text-sm font-semibold text-ink outline-none hover:bg-amber-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-teal-brand"
                >
                    {doneLabel}
                </button>
            </div>
        </div>
    )
}

function Fact({
    label,
    value,
    icon,
}: {
    label: string
    value: string
    icon?: ReactNode
}) {
    return (
        <div className="rounded-2xl border border-hairline bg-white px-3 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft/70">
                {label}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 font-display text-lg leading-none sm:text-xl">
                {icon}
                {value}
            </p>
        </div>
    )
}

function PathStop({
    point,
    index,
    last,
    how,
}: {
    point: RouteWaypoint
    index: number
    last: boolean
    how: string
}) {
    const start = index === 0
    const Icon = last ? Flag : start ? Navigation : MapPin

    return (
        <li className="flex gap-3.5 py-2.5">
            <span
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                    last
                        ? 'bg-amber-brand text-ink'
                        : start
                          ? 'bg-ink text-white'
                          : 'border-2 border-ink/15 bg-cream text-ink'
                }`}
            >
                <Icon className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft/60">
                    {start ? 'Start' : last ? 'Last stop' : `Stop ${index}`}
                </p>
                <p className="mt-0.5 font-display text-xl leading-tight">{point.name}</p>
                <p className="mt-1 text-sm text-ink-soft">
                    {start
                        ? `Begin ${how} from here.`
                        : last
                          ? 'You are at the gate. Go on in.'
                          : point.kind === 'turn'
                            ? 'Take this turn, then keep going.'
                            : 'Stay on this road.'}
                </p>
            </div>
        </li>
    )
}
