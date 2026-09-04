'use client'

import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, SkipForward } from 'lucide-react'

import type { DirectionsResult } from '@/site/lib/directions'
import { alongPath, nearestOnPath, pathUntil } from '@/site/lib/alongPath'
import type { Coords } from '@/site/lib/geo'
import { distanceKm, formatDistance, formatDuration } from '@/site/lib/geo'
import { TRAVEL_MODES, type TravelMode } from '@/site/lib/travelModes'

type LeafletMap = {
    remove: () => void
    setView: (center: [number, number], zoom?: number, options?: { animate?: boolean }) => void
    fitBounds: (bounds: [[number, number], [number, number]], options?: { padding?: [number, number] }) => void
    panTo: (center: [number, number], options?: { animate?: boolean }) => void
}

type LeafletMarker = {
    setLatLng: (latlng: [number, number]) => void
    setIcon: (icon: unknown) => void
}

type LeafletPolyline = {
    setLatLngs: (latlngs: [number, number][]) => void
    getBounds: () => {
        getSouthWest: () => { lat: number; lng: number }
        getNorthEast: () => { lat: number; lng: number }
    }
}

type LeafletNamespace = {
    map: (el: HTMLElement, options: Record<string, unknown>) => LeafletMap & {
        eachLayer?: (fn: (layer: { remove: () => void }) => void) => void
    }
    tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void }
    polyline: (latlngs: [number, number][], options: Record<string, unknown>) => {
        addTo: (map: LeafletMap) => LeafletPolyline
        setLatLngs: (latlngs: [number, number][]) => void
        getBounds: () => {
            getSouthWest: () => { lat: number; lng: number }
            getNorthEast: () => { lat: number; lng: number }
        }
    }
    marker: (latlng: [number, number], options: Record<string, unknown>) => LeafletMarker & { addTo: (map: LeafletMap) => LeafletMarker }
    divIcon: (options: Record<string, unknown>) => unknown
    latLngBounds: (latlngs: [number, number][]) => { pad: (n: number) => unknown }
}

declare global {
    interface Window {
        google?: {
            maps: {
                Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMap
                Polyline: new (opts: Record<string, unknown>) => {
                    setMap: (map: GoogleMap | null) => void
                    setPath: (path: unknown) => void
                }
                Marker: new (opts: Record<string, unknown>) => GoogleMarker
                LatLng: new (lat: number, lng: number) => unknown
                Point: new (x: number, y: number) => unknown
                Size: new (w: number, h: number) => unknown
            }
        }
    }
}

type GoogleMap = {
    panTo: (latLng: unknown) => void
    setZoom: (zoom: number) => void
    fitBounds: (bounds: unknown) => void
}

type GoogleMarker = {
    setPosition: (latLng: unknown) => void
    setIcon: (icon: unknown) => void
    setMap: (map: GoogleMap | null) => void
}

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const DEMO_MS = 16000
const GPS_GRACE_MS = 1400
const GPS_IDLE_MS = 4500
const GPS_MOVE_KM = 0.025
const ARRIVE_T = 0.97
const ARRIVE_KM = 0.05

type TrackKind = 'waiting' | 'demo' | 'live'

function rideChatter(
    progress: number,
    placeName: string,
    mode: TravelMode,
    kind: TrackKind
): string {
    if (kind === 'waiting') return 'Give me a second — seeing if your phone will move…'
    if (kind === 'demo') {
        if (progress < 0.5) return "You're at a desk, so I'll play the road for you."
        return `Demo still rolling — ${placeName} is coming up.`
    }
    const how = TRAVEL_MODES[mode].label.toLowerCase()
    if (progress < 0.22) return `Live now — ${how}. I'm on this road with you.`
    if (progress < 0.55) return "Keep going. I'll stay snapped to the route."
    if (progress < 0.82) return 'Nearly there. You can see it from this road.'
    return `And this is ${placeName}. Come on.`
}

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`)
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true })
            if ((existing as HTMLScriptElement).dataset.loaded === 'true') resolve()
            return
        }
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.onload = () => {
            script.dataset.loaded = 'true'
            resolve()
        }
        script.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.head.appendChild(script)
    })
}

async function loadLeaflet(): Promise<LeafletNamespace> {
    const leaflet = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    return leaflet.default as unknown as LeafletNamespace
}

async function loadGoogle(): Promise<NonNullable<typeof window.google>> {
    if (window.google?.maps) return window.google
    await loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_KEY)}`
    )
    if (!window.google?.maps) throw new Error('Google Maps failed to load')
    return window.google
}

function pinHtml(label: string, tone: 'you' | 'place', live = false): string {
    const bg = tone === 'you' ? '#1a2330' : '#e8a317'
    const fg = tone === 'you' ? '#fff' : '#1a2330'
    const pulse = live ? ' buddy-live-pulse' : ''
    return `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px)">
      <span style="background:${bg};color:${fg};font:600 10px/1 system-ui,sans-serif;padding:6px 8px;border-radius:999px;white-space:nowrap">${label}</span>
      <span class="${pulse}" style="width:10px;height:10px;border-radius:99px;background:${tone === 'you' && live ? '#22c55e' : bg};margin-top:4px;box-shadow:0 0 0 3px ${bg}33"></span>
    </div>`
}

function buddyMarkerHtml(mode: TravelMode): string {
    const person = `<svg viewBox="0 0 64 64" width="52" height="52" aria-hidden="true">
      <ellipse cx="32" cy="58" rx="16" ry="3" fill="rgba(0,0,0,.2)"/>
      <path d="M20 58c2-14 8-20 12-20s10 6 12 20z" fill="#2a3344"/>
      <path d="M18 40c2-10 8-14 14-14s12 4 14 14c-8 4-20 4-28 0z" fill="#3d8a8a"/>
      <path d="M22 38c6 4 14 4 20 0" stroke="#e8a317" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="20" r="12" fill="#e0b48a"/>
      <path d="M21 18c1-8 6-12 11-12s10 4 11 12c-2-4-6-6-11-6s-9 2-11 6z" fill="#2a2433"/>
      <circle cx="28" cy="20" r="2.2" fill="#1a2330"/>
      <circle cx="36" cy="20" r="2.2" fill="#1a2330"/>
      <path d="M28 26c2.5 3 5.5 3 8 0" stroke="#7a4030" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </svg>`

    const vehicle: Record<TravelMode, string> = {
        walk: person,
        cycle: `<div style="display:flex;flex-direction:column;align-items:center">${person}<span style="margin-top:-8px;background:#1a2330;color:#fff;font:700 9px/1 system-ui;padding:3px 6px;border-radius:999px">cycle</span></div>`,
        auto: `<div style="display:flex;flex-direction:column;align-items:center">${person}<span style="margin-top:-8px;background:#e8a317;color:#1a2330;font:700 9px/1 system-ui;padding:3px 6px;border-radius:999px">auto</span></div>`,
        bus: `<div style="display:flex;flex-direction:column;align-items:center">${person}<span style="margin-top:-8px;background:#3d5a9a;color:#fff;font:700 9px/1 system-ui;padding:3px 6px;border-radius:999px">bus</span></div>`,
        car: `<div style="display:flex;flex-direction:column;align-items:center">${person}<span style="margin-top:-8px;background:#c4452d;color:#fff;font:700 9px/1 system-ui;padding:3px 6px;border-radius:999px">car</span></div>`,
    }

    return vehicle[mode]
}

export function BuddyMapRide({
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
    const mapEl = useRef<HTMLDivElement>(null)
    const [route, setRoute] = useState<DirectionsResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const [trackKind, setTrackKind] = useState<TrackKind>('waiting')
    const arrived = useRef(false)
    const onArrivedRef = useRef(onArrived)

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
                    setError('Could not draw a road. I will still take you there as the crow flies.')
                    setRoute({
                        points: [from, to],
                        km: 0,
                        minutes: 1,
                        provider: 'osm',
                        waypoints: [
                            { id: 'start', name: 'Where you are', kind: 'start', metres: 0, metresFromPrev: 0 },
                            { id: 'end', name: 'The place', kind: 'end', metres: 200, metresFromPrev: 200 },
                        ],
                    })
                }
            })
        return () => {
            cancelled = true
        }
    }, [origin.lat, origin.lng, destination.lat, destination.lng, mode])

    useEffect(() => {
        if (!route || !mapEl.current) return
        if (prefersReducedMotion()) {
            onArrivedRef.current()
            return
        }

        const node = mapEl.current
        const dest = route.points[route.points.length - 1]
        const originPoint = route.points[0]
        let cancelled = false
        let frame = 0
        let watchId: number | null = null
        let cleanup = () => {}
        let t = 0
        let kind: TrackKind = 'waiting'
        let gpsAnchor: Coords | null = null
        let lastGps: Coords | null = null
        let lastGpsMoveAt = 0
        let demoFromT = 0
        let demoStartedAt = 0
        const effectStartedAt = performance.now()

        const paint = (engine: MapEngine, nextT: number, youPoint: Coords, nextKind: TrackKind) => {
            t =
                nextKind === 'live'
                    ? Math.min(1, Math.max(0, nextT))
                    : Math.min(1, Math.max(t, nextT))
            kind = nextKind
            const { point, bearing } = alongPath(route.points, t)
            const travelled = pathUntil(route.points, Math.max(t, 0.0001))
            engine.updateBuddy(point, bearing)
            engine.updateYou(youPoint, nextKind === 'live')
            engine.updateTravelled(travelled.length >= 2 ? travelled : [originPoint, point])
            setProgress(t)
            setTrackKind((current) => (current === nextKind ? current : nextKind))
            if ((t >= ARRIVE_T || distanceKm(point, dest) < ARRIVE_KM) && !arrived.current) {
                arrived.current = true
                onArrivedRef.current()
            }
        }

        const beginDemo = (now: number) => {
            if (kind === 'demo') return
            kind = 'demo'
            demoFromT = t
            demoStartedAt = now
        }

        const run = async () => {
            const engine = GOOGLE_KEY
                ? await startGoogleMap(node, route, mode)
                : await startOsmMap(node, route, mode)
            if (cancelled) {
                engine.destroy()
                return
            }
            cleanup = engine.destroy
            arrived.current = false
            setTrackKind('waiting')

            const tick = (now: number) => {
                if (cancelled || arrived.current) return

                if (kind === 'live' && now - lastGpsMoveAt > GPS_IDLE_MS) {
                    beginDemo(now)
                } else if (kind === 'waiting' && now - effectStartedAt > GPS_GRACE_MS) {
                    beginDemo(now)
                }

                if (kind === 'demo') {
                    const remaining = Math.max(400, DEMO_MS * (1 - demoFromT))
                    const ratio = Math.min(1, (now - demoStartedAt) / remaining)
                    paint(
                        engine,
                        demoFromT + (1 - demoFromT) * ratio,
                        lastGps ?? originPoint,
                        'demo'
                    )
                }

                if (!arrived.current) frame = requestAnimationFrame(tick)
            }

            if (navigator.geolocation) {
                watchId = navigator.geolocation.watchPosition(
                    (pos) => {
                        if (cancelled || arrived.current) return
                        const gps = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                        if (!gpsAnchor) {
                            gpsAnchor = gps
                            lastGps = gps
                            engine.updateYou(gps, false)
                            return
                        }
                        lastGps = gps
                        const moved =
                            distanceKm(gpsAnchor, gps) >= GPS_MOVE_KM &&
                            (pos.coords.accuracy === 0 || pos.coords.accuracy <= 80)
                        if (!moved) {
                            if (kind !== 'live') engine.updateYou(gps, false)
                            return
                        }
                        lastGpsMoveAt = performance.now()
                        const snap = nearestOnPath(route.points, gps)
                        paint(engine, snap.t, gps, 'live')
                    },
                    () => {
                        /* permission denied or unavailable — demo playback takes over */
                    },
                    { enableHighAccuracy: true, maximumAge: 1500, timeout: 8000 }
                )
                if (cancelled && watchId !== null) {
                    navigator.geolocation.clearWatch(watchId)
                    watchId = null
                }
            }

            frame = requestAnimationFrame(tick)
        }

        void run()

        return () => {
            cancelled = true
            cancelAnimationFrame(frame)
            if (watchId !== null) navigator.geolocation.clearWatch(watchId)
            cleanup()
        }
    }, [route, mode])

    const remainingKm = route ? route.km * (1 - progress) : null
    const remainingMin =
        remainingKm === null || !route ? null : Math.max(1, Math.round(route.minutes * (1 - progress)))
    const percent = Math.round(progress * 100)

    return (
        <div className={`relative isolate overflow-hidden bg-ink ${className}`}>
            <div ref={mapEl} className="absolute inset-0" role="img" aria-label={`Map route to ${destinationName}`} />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/85 to-transparent"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink/90 to-transparent"
            />

            <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-3 p-4 sm:p-6">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                trackKind === 'live'
                                    ? 'bg-emerald-500 text-ink'
                                    : trackKind === 'demo'
                                      ? 'bg-amber-brand text-ink'
                                      : 'bg-white/15 text-white/80'
                            }`}
                        >
                            {trackKind === 'live' ? 'Live' : trackKind === 'demo' ? 'Demo' : 'Finding you'}
                        </span>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                            On the way {originLabel}
                        </p>
                    </div>
                    <p className="mt-1 font-display text-2xl leading-tight text-white sm:text-3xl">
                        Taking you to {destinationName}
                    </p>
                    {route && (
                        <p className="mt-1 text-xs text-white/55">
                            {route.provider === 'google' ? 'Google road' : 'Open street map'} ·{' '}
                            {formatDistance(route.km)} · about {formatDuration(route.minutes)}
                            {trackKind === 'demo' ? ' · playback for the desk' : ''}
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

            <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
                <div className="rounded-2xl border border-white/15 bg-ink/70 p-4 backdrop-blur-md">
                    {!route ? (
                        <p className="flex items-center gap-2 text-sm text-white/70">
                            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                            Drawing the road…
                        </p>
                    ) : (
                        <>
                            {error && <p className="mb-2 text-xs text-amber-brand">{error}</p>}
                            <div
                                role="progressbar"
                                aria-valuenow={percent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Journey to ${destinationName}`}
                                className="h-1.5 w-full overflow-hidden rounded-full bg-white/15"
                            >
                                <div
                                    className="h-full rounded-full bg-amber-brand"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
                                <p aria-live="polite" className="text-white/90">
                                    {rideChatter(progress, destinationName, mode, trackKind)}
                                </p>
                                {remainingKm !== null && remainingMin !== null && (
                                    <p className="tabular-nums">
                                        {formatDistance(remainingKm)} to go · about{' '}
                                        {formatDuration(remainingMin)}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

type MapEngine = {
    updateBuddy: (point: Coords, bearing: number) => void
    updateYou: (point: Coords, live: boolean) => void
    updateTravelled: (points: Coords[]) => void
    destroy: () => void
}

function youIcon(L: LeafletNamespace, live: boolean) {
    return L.divIcon({
        className: '',
        html: pinHtml('You', 'you', live),
        iconSize: [64, 40],
        iconAnchor: [32, 40],
    })
}

async function startOsmMap(
    node: HTMLElement,
    route: DirectionsResult,
    mode: TravelMode
): Promise<MapEngine> {
    const L = await loadLeaflet()
    node.replaceChildren()
    const map = L.map(node, {
        zoomControl: false,
        attributionControl: true,
        dragging: true,
        scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map)

    const latlngs = route.points.map((point) => [point.lat, point.lng] as [number, number])
    const remaining = L.polyline(latlngs, {
        color: '#e8a317',
        weight: 6,
        opacity: 0.4,
        lineCap: 'round',
        lineJoin: 'round',
    })
    remaining.addTo(map)
    const travelled = L.polyline([latlngs[0], latlngs[0]], {
        color: '#5ec8c8',
        weight: 7,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
    })
    travelled.addTo(map)

    const bounds = remaining.getBounds()
    map.fitBounds(
        [
            [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
            [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
        ],
        { padding: [48, 48] }
    )

    const you = L.marker(latlngs[0], {
        icon: youIcon(L, false),
        interactive: false,
    }).addTo(map)
    let youIsLive = false

    L.marker(latlngs[latlngs.length - 1], {
        icon: L.divIcon({
            className: '',
            html: pinHtml('Here', 'place'),
            iconSize: [64, 40],
            iconAnchor: [32, 40],
        }),
        interactive: false,
    }).addTo(map)

    const buddy = L.marker(latlngs[0], {
        icon: L.divIcon({
            className: '',
            html: `<div class="buddy-map-pin">${buddyMarkerHtml(mode)}</div>`,
            iconSize: [56, 64],
            iconAnchor: [28, 56],
        }),
        interactive: false,
        zIndexOffset: 600,
    }).addTo(map)

    return {
        updateBuddy(point, bearing) {
            buddy.setLatLng([point.lat, point.lng])
            const pin = node.querySelector('.buddy-map-pin') as HTMLElement | null
            if (pin) pin.style.transform = `rotate(${bearing}deg)`
            map.panTo([point.lat, point.lng], { animate: false })
        },
        updateYou(point, live) {
            you.setLatLng([point.lat, point.lng])
            if (live !== youIsLive) {
                youIsLive = live
                you.setIcon(youIcon(L, live))
            }
        },
        updateTravelled(points) {
            travelled.setLatLngs(points.map((point) => [point.lat, point.lng] as [number, number]))
        },
        destroy() {
            map.remove()
        },
    }
}

const NIGHT_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#1d2430' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8b93a1' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2430' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2b3545' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1d2430' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#15202b' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

async function startGoogleMap(
    node: HTMLElement,
    route: DirectionsResult,
    mode: TravelMode
): Promise<MapEngine> {
    const google = await loadGoogle()
    node.replaceChildren()
    const start = route.points[0]
    const map = new google.maps.Map(node, {
        center: { lat: start.lat, lng: start.lng },
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        styles: NIGHT_STYLE,
        backgroundColor: '#1d2430',
    })

    new google.maps.Polyline({
        path: route.points,
        strokeColor: '#e8a317',
        strokeOpacity: 0.4,
        strokeWeight: 6,
        map,
    })

    const travelled = new google.maps.Polyline({
        path: [route.points[0], route.points[0]],
        strokeColor: '#5ec8c8',
        strokeOpacity: 0.95,
        strokeWeight: 7,
        map,
    })

    const toIcon = (html: string, size: number) => ({
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
              <foreignObject width="100%" height="100%">${html}</foreignObject>
            </svg>`
        )}`,
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size - 4),
    })

    const you = new google.maps.Marker({
        position: route.points[0],
        map,
        icon: toIcon(pinHtml('You', 'you'), 64),
        clickable: false,
    })
    let youIsLive = false

    new google.maps.Marker({
        position: route.points[route.points.length - 1],
        map,
        icon: toIcon(pinHtml('Here', 'place'), 64),
        clickable: false,
    })

    const buddy = new google.maps.Marker({
        position: route.points[0],
        map,
        icon: toIcon(buddyMarkerHtml(mode), 56),
        clickable: false,
        zIndex: 600,
    })

    return {
        updateBuddy(point) {
            const latLng = new google.maps.LatLng(point.lat, point.lng)
            buddy.setPosition(latLng)
            map.panTo(latLng)
        },
        updateYou(point, live) {
            you.setPosition(new google.maps.LatLng(point.lat, point.lng))
            if (live !== youIsLive) {
                youIsLive = live
                you.setIcon(toIcon(pinHtml('You', 'you', live), 64))
            }
        },
        updateTravelled(points) {
            travelled.setPath(points)
        },
        destroy() {
            buddy.setMap(null)
            you.setMap(null)
            travelled.setMap(null)
            node.replaceChildren()
        },
    }
}
