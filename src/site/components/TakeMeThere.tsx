'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, Navigation, X } from 'lucide-react'

import { LocationNotice } from '@/site/components/LocationNotice'
import { useLocation } from '@/site/components/location-provider'
import type { Coords } from '@/site/lib/geo'
import { distanceKm, formatDistance, formatDuration } from '@/site/lib/geo'
import { googleMapsDirUrl, recommendMode } from '@/site/lib/maps'
import { minutesFor, TRAVEL_MODES, type TravelMode } from '@/site/lib/travelModes'

export function TakeMeThere({
    destination,
    destinationName,
    className,
    children = (
        <>
            <Navigation className="size-4" aria-hidden="true" />
            Get directions
        </>
    ),
}: {
    destination: Coords | null
    destinationName: string
    className?: string
    children?: ReactNode
}) {
    const { startPoint } = useLocation()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!open) return
        const previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = previous
            window.removeEventListener('keydown', onKey)
        }
    }, [open])

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={!destination}
                className={className}
            >
                {children}
            </button>

            {open &&
                destination &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Directions to ${destinationName}`}
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/70 p-4 sm:items-center"
                    >
                        <button
                            type="button"
                            aria-label="Close"
                            className="absolute inset-0 cursor-default"
                            onClick={() => setOpen(false)}
                        />
                        <div className="relative z-10 w-full max-w-md rounded-[1.75rem] bg-cream p-6 text-ink shadow-card-hover sm:p-8">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="absolute right-4 top-4 inline-flex size-12 items-center justify-center rounded-full border border-ink/15 bg-white text-ink outline-none hover:bg-cream focus-visible:ring-2 focus-visible:ring-teal-brand"
                            >
                                <X className="size-5" aria-hidden="true" />
                                <span className="sr-only">Close</span>
                            </button>
                            {startPoint ? (
                                <DirectionsSummary
                                    origin={startPoint.coords}
                                    originLabel={startPoint.label}
                                    fromCentre={startPoint.kind === 'centre'}
                                    destination={destination}
                                    destinationName={destinationName}
                                />
                            ) : (
                                <>
                                    <p className="pr-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-brand-dark">
                                        Starting point
                                    </p>
                                    <h2 className="mt-2 font-display text-2xl leading-tight">
                                        Confirm where to start before I give directions
                                    </h2>
                                    <LocationNotice className="mt-5" />
                                </>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    )
}

export function DirectionsSummary({
    origin,
    originLabel,
    fromCentre,
    destination,
    destinationName,
    mode: forcedMode,
    onContinue,
    continueLabel = "I'm there",
}: {
    origin: Coords
    originLabel: string
    fromCentre: boolean
    destination: Coords
    destinationName: string
    mode?: TravelMode
    onContinue?: () => void
    continueLabel?: string
}) {
    const km = distanceKm(origin, destination)
    const mode = forcedMode ?? recommendMode(km)
    const minutes = minutesFor(km, mode)
    const Icon = TRAVEL_MODES[mode].icon
    const mapsUrl = googleMapsDirUrl(origin, destination, mode)

    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-brand-dark">
                Directions
            </p>
            <h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
                {destinationName}
            </h2>
            <p className="mt-2 text-base text-ink-soft">
                From {originLabel.toLowerCase()}. Open Google Maps for turn-by-turn.
            </p>

            {fromCentre && (
                <p className="mt-3 rounded-xl bg-ink px-4 py-3 text-base text-white">
                    Location unavailable. Distances are currently measured from {originLabel}.
                </p>
            )}

            <dl className="mt-5 grid grid-cols-3 gap-2">
                <Fact label="Distance" value={formatDistance(km)} />
                <Fact label="Time" value={`about ${formatDuration(minutes)}`} />
                <Fact
                    label="Transport"
                    value={TRAVEL_MODES[mode].label}
                    icon={<Icon className="size-4" aria-hidden="true" />}
                />
            </dl>

            <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-brand px-5 text-base font-semibold text-ink outline-none hover:bg-amber-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-teal-brand"
            >
                <ExternalLink className="size-4" aria-hidden="true" />
                Open in Google Maps
            </a>

            {onContinue && (
                <button
                    type="button"
                    onClick={onContinue}
                    className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-ink/15 bg-white px-5 text-base font-semibold text-ink outline-none hover:bg-cream focus-visible:ring-2 focus-visible:ring-teal-brand"
                >
                    {continueLabel}
                </button>
            )}
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                {label}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 font-display text-lg leading-tight">
                {icon}
                {value}
            </p>
        </div>
    )
}
