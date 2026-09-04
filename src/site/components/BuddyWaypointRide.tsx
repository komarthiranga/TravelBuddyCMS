'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import {
    Bus,
    Check,
    Flag,
    Hospital,
    Landmark,
    LoaderCircle,
    MapPin,
    School,
    ShoppingBag,
    SkipForward,
    Trees,
    CornerUpRight,
} from 'lucide-react'

import { JourneyScene } from '@/site/components/JourneyScene'
import type { DirectionsResult } from '@/site/lib/directions'
import type { Coords } from '@/site/lib/geo'
import { formatDuration } from '@/site/lib/geo'
import { TRAVEL_MODES, type TravelMode } from '@/site/lib/travelModes'
import {
    fallbackWaypoints,
    formatMetres,
    type RouteWaypoint,
    type WaypointKind,
} from '@/site/lib/waypoints'

const KIND_ICON: Record<WaypointKind, typeof MapPin> = {
    start: MapPin,
    bus: Bus,
    temple: Landmark,
    school: School,
    hospital: Hospital,
    shop: ShoppingBag,
    park: Trees,
    turn: CornerUpRight,
    road: CornerUpRight,
    end: Flag,
}

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function dwellMs(count: number): number {
    return Math.round(Math.max(2000, Math.min(3400, 13000 / Math.max(3, count))))
}

function labelWaypoints(
    waypoints: RouteWaypoint[],
    destinationName: string,
    fromYou: boolean
): RouteWaypoint[] {
    return waypoints.map((point, index) => {
        if (index === 0) {
            return { ...point, name: fromYou ? 'Where you are' : 'Middle of town' }
        }
        if (index === waypoints.length - 1) {
            return { ...point, name: destinationName, kind: 'end' }
        }
        return point
    })
}

function chatter(point: RouteWaypoint, mode: TravelMode, index: number, last: number): string {
    const how = TRAVEL_MODES[mode].label.toLowerCase()
    if (index === 0) return `Right — ${how}. I'll call every pointer as we pass it.`
    if (index === last) return `And this is it. Come on.`
    if (point.metresFromPrev > 0) {
        return `${point.name} — ${formatMetres(point.metresFromPrev)} from the last one.`
    }
    return `Next, ${point.name}.`
}

export function BuddyWaypointRide({
    origin,
    destination,
    destinationName,
    mode,
    originLabel,
    onArrived,
    onSkip,
    className = '',
}: {
    origin: Coords
    destination: Coords
    destinationName: string
    mode: TravelMode
    originLabel: string
    onArrived: () => void
    onSkip: () => void
    className?: string
}) {
    const [route, setRoute] = useState<DirectionsResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [index, setIndex] = useState(0)
    const arrived = useRef(false)
    const onArrivedRef = useRef(onArrived)
    const scrollerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        onArrivedRef.current = onArrived
    }, [onArrived])

    useEffect(() => {
        const from = { lat: origin.lat, lng: origin.lng }
        const to = { lat: destination.lat, lng: destination.lng }
        const params = new URLSearchParams({
            fromLat: String(from.lat),
            fromLng: String(from.lng),
            toLat: String(to.lat),
            toLng: String(to.lng),
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
                    setError("Couldn't name the road. I'll still walk you point by point.")
                    setRoute({
                        points: [from, to],
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

    const fromYou = originLabel.includes('where you are')
    const waypoints = labelWaypoints(
        route?.waypoints?.length ? route.waypoints : fallbackWaypoints(Math.round((route?.km ?? 0.4) * 1000)),
        destinationName,
        fromYou
    )
    const current = waypoints[Math.min(index, waypoints.length - 1)]

    useEffect(() => {
        if (!route) return
        if (prefersReducedMotion()) {
            onArrivedRef.current()
            return
        }

        const points = route.waypoints?.length ? route.waypoints : fallbackWaypoints(400)
        const dwell = dwellMs(points.length)
        const started = performance.now()
        let frame = 0
        arrived.current = false

        const tick = (now: number) => {
            const elapsed = now - started
            const nextIndex = Math.min(points.length - 1, Math.floor(elapsed / dwell))
            setIndex((current) => (current === nextIndex ? current : nextIndex))
            if (elapsed >= dwell * points.length) {
                if (!arrived.current) {
                    arrived.current = true
                    onArrivedRef.current()
                }
                return
            }
            frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [route])

    useEffect(() => {
        const root = scrollerRef.current
        const slide = root?.querySelector<HTMLElement>(`[data-step="${index}"]`)
        if (!root || !slide) return
        const left = slide.offsetLeft - (root.clientWidth - slide.clientWidth) / 2
        root.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
    }, [index, route])

    return (
        <div className={`relative isolate overflow-hidden bg-ink ${className}`}>
            <JourneyScene
                mode={mode}
                moving
                framed={false}
                lift
                className="absolute inset-0 h-full"
            />

            {current && current.kind !== 'start' && (
                <div
                    key={current.id}
                    aria-hidden="true"
                    className="waypoint-flyby pointer-events-none absolute bottom-[36%] right-[8%] z-[5] hidden md:block"
                >
                    <Signboard point={current} />
                </div>
            )}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/80 to-transparent"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/95 via-ink/55 to-transparent sm:h-52"
            />

            <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-3 p-4 sm:p-6">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                        Pointers {originLabel}
                    </p>
                    <p className="mt-1 font-display text-2xl leading-tight text-white sm:text-3xl">
                        Taking you to {destinationName}
                    </p>
                    {route && (
                        <p className="mt-1 text-xs text-white/55">
                            {waypoints.length} pointers · about {formatDuration(route.minutes)}
                            {TRAVEL_MODES[mode].label !== 'On foot'
                                ? ` ${TRAVEL_MODES[mode].label.toLowerCase()}`
                                : ' on foot'}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onSkip}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-ink/50 px-5 py-2.5 text-sm font-semibold text-white outline-none backdrop-blur-md transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                >
                    <SkipForward className="size-4" aria-hidden="true" />
                    Skip ahead
                </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
                <div className="mx-auto w-full max-w-6xl">
                    {!route ? (
                        <p className="mx-4 flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-ink/70 px-4 py-3 text-sm text-white/70 backdrop-blur-md sm:mx-6">
                            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                            Marking the pointers…
                        </p>
                    ) : (
                        <PointerCarousel
                            waypoints={waypoints}
                            index={index}
                            error={error}
                            line={
                                current
                                    ? chatter(current, mode, index, waypoints.length - 1)
                                    : ''
                            }
                            scrollerRef={scrollerRef}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

function PointerCarousel({
    waypoints,
    index,
    error,
    line,
    scrollerRef,
}: {
    waypoints: RouteWaypoint[]
    index: number
    error: string | null
    line: string
    scrollerRef: RefObject<HTMLDivElement | null>
}) {
    const last = Math.max(1, waypoints.length - 1)
    const progress = Math.min(100, (index / last) * 100)

    return (
        <div>
            <div className="px-5 sm:px-8">
                <div
                    className="h-1 overflow-hidden rounded-full bg-white/15"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress)}
                    aria-label="Pointers along the ride"
                >
                    <div
                        className="h-full rounded-full bg-amber-brand transition-[width] duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div
                ref={scrollerRef}
                className="pointer-carousel mt-3 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-[11vw] pb-1 pt-1 sm:gap-4 sm:px-8"
            >
                {waypoints.map((point, i) => {
                    const Icon = KIND_ICON[point.kind]
                    const passed = i < index
                    const active = i === index
                    const next = waypoints[i + 1]
                    const status =
                        i === 0 ? "We're off" : i === waypoints.length - 1 ? "We're here" : 'Passing'
                    return (
                        <article
                            key={point.id}
                            data-step={i}
                            aria-current={active ? 'step' : undefined}
                            className={`relative w-[min(78vw,20.5rem)] shrink-0 snap-center rounded-[1.5rem] border px-4 py-3.5 backdrop-blur-md transition duration-500 sm:w-[min(42vw,19rem)] sm:px-5 sm:py-4 lg:w-[17.5rem] ${
                                active
                                    ? 'scale-100 border-amber-brand/70 bg-ink/80 text-white shadow-[0_18px_40px_-24px_black]'
                                    : passed
                                      ? 'scale-[0.94] border-white/10 bg-ink/45 text-white/50'
                                      : 'scale-[0.94] border-white/10 bg-ink/50 text-white/65'
                            }`}
                        >
                            {i < waypoints.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className={`absolute -right-3 top-1/2 hidden h-px w-3 -translate-y-1/2 sm:block ${
                                        passed || active ? 'bg-amber-brand/70' : 'bg-white/20'
                                    }`}
                                />
                            )}
                            <div className="flex items-center gap-2.5">
                                <span
                                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                                        active
                                            ? 'bg-amber-brand text-ink'
                                            : passed
                                              ? 'bg-white/15'
                                              : 'bg-white/10'
                                    }`}
                                >
                                    {passed ? (
                                        <Check className="size-4" aria-hidden="true" />
                                    ) : (
                                        <Icon className="size-4" aria-hidden="true" />
                                    )}
                                </span>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-brand">
                                    {status}
                                    <span className="text-white/40">
                                        {' '}
                                        · {i + 1}/{waypoints.length}
                                    </span>
                                </p>
                            </div>
                            <p className="mt-2 truncate font-display text-2xl leading-none sm:text-[1.7rem]">
                                {point.name}
                            </p>
                            {point.metresFromPrev > 0 && (
                                <p className="mt-1.5 text-sm font-semibold text-amber-brand">
                                    {formatMetres(point.metresFromPrev)} from the last one
                                </p>
                            )}
                            {active && next && (
                                <p className="mt-1 truncate text-xs text-white/55">
                                    Then {next.name}
                                    {next.metresFromPrev > 0
                                        ? ` · ${formatMetres(next.metresFromPrev)}`
                                        : ''}
                                </p>
                            )}
                        </article>
                    )
                })}
            </div>

            <div className="mt-3 flex flex-col items-center gap-2 px-5 sm:px-8">
                <ol className="flex items-center gap-1.5">
                    {waypoints.map((point, i) => (
                        <li key={point.id}>
                            <span
                                className={`block h-1.5 rounded-full transition-all ${
                                    i === index
                                        ? 'w-6 bg-amber-brand'
                                        : i < index
                                          ? 'w-1.5 bg-amber-brand/50'
                                          : 'w-1.5 bg-white/30'
                                }`}
                            >
                                <span className="sr-only">
                                    {i === index ? 'Current: ' : i < index ? 'Passed: ' : 'Upcoming: '}
                                    {point.name}
                                </span>
                            </span>
                        </li>
                    ))}
                </ol>
                {error && <p className="text-center text-xs text-amber-brand">{error}</p>}
                <p
                    aria-live="polite"
                    className="max-w-xl text-center text-[13px] leading-snug text-white/75 sm:text-sm"
                >
                    {line}
                </p>
            </div>
        </div>
    )
}

function Signboard({ point }: { point: RouteWaypoint }) {
    const Icon = KIND_ICON[point.kind]
    return (
        <div className="flex flex-col items-center">
            <div className="rounded-2xl border border-white/20 bg-ink/80 px-4 py-3 text-center shadow-[0_18px_40px_-18px_black] backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-brand">
                    {point.metresFromPrev > 0 ? formatMetres(point.metresFromPrev) : 'Here'}
                </p>
                <p className="mt-1 flex items-center justify-center gap-1.5 font-display text-lg text-white">
                    <Icon className="size-4" aria-hidden="true" />
                    {point.name}
                </p>
            </div>
            <span className="h-16 w-1.5 rounded-b-full bg-amber-brand/80" />
        </div>
    )
}
