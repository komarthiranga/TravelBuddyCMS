'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { LoaderCircle, Navigation, X } from 'lucide-react'

import { BuddyMapRide } from '@/site/components/BuddyMapRide'
import { useLocation } from '@/site/components/location-provider'
import type { Coords } from '@/site/lib/geo'
import { TRAVEL_MODE_ORDER, TRAVEL_MODES, type TravelMode } from '@/site/lib/travelModes'

export function TakeMeThere({
    destination,
    destinationName,
    className,
    children = (
        <>
            <Navigation className="size-4" aria-hidden="true" />
            Take me there
        </>
    ),
}: {
    destination: Coords | null
    destinationName: string
    className?: string
    children?: ReactNode
}) {
    const { coords, status, request } = useLocation()
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<TravelMode | null>(null)
    const [finished, setFinished] = useState(false)

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

    function start() {
        if (!destination) return
        setMode(null)
        setFinished(false)
        setOpen(true)
        if (!coords) request()
    }

    return (
        <>
            <button type="button" onClick={start} disabled={!destination} className={className}>
                {children}
            </button>

            {open &&
                destination &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Take you to ${destinationName}`}
                    className="fixed inset-0 z-[100] bg-ink"
                >
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false)
                            setMode(null)
                        }}
                        className="absolute right-4 top-4 z-20 inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-ink/60 text-white outline-none backdrop-blur-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                    >
                        <X className="size-5" aria-hidden="true" />
                        <span className="sr-only">Close the map</span>
                    </button>

                    {!coords || !mode || finished ? (
                        <div className="flex h-full items-center justify-center px-5">
                            <div className="w-full max-w-md rounded-[1.75rem] border border-white/15 bg-white/10 p-6 text-white backdrop-blur-md sm:p-8">
                                {finished ? (
                                    <>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                                            We&apos;re here
                                        </p>
                                        <p className="mt-3 font-display text-3xl leading-tight">
                                            {destinationName}. Go on in.
                                        </p>
                                        <p className="mt-4 text-sm leading-relaxed text-white/70">
                                            I rode the actual road with you. If you need the phone
                                            to keep guiding after this, say the word — otherwise
                                            I&apos;ll wait here.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpen(false)
                                                setMode(null)
                                                setFinished(false)
                                            }}
                                            className="mt-7 inline-flex items-center gap-2 rounded-full bg-amber-brand px-6 py-3 text-sm font-semibold text-ink outline-none hover:bg-amber-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                                        >
                                            Thanks, I&apos;ve got it
                                        </button>
                                    </>
                                ) : !coords ? (
                                    <>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                                            First, where are you
                                        </p>
                                        <p className="mt-3 font-display text-3xl leading-tight">
                                            I need your pin so I can start from here.
                                        </p>
                                        <p className="mt-4 text-sm leading-relaxed text-white/70">
                                            Same as a Zomato order — I pick you up from where you
                                            are, then I ride the actual road to {destinationName}.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={request}
                                            disabled={status === 'locating' || status === 'unavailable'}
                                            className="mt-7 inline-flex items-center gap-2 rounded-full bg-amber-brand px-6 py-3 text-sm font-semibold text-ink outline-none hover:bg-amber-brand-dark hover:text-white disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-white"
                                        >
                                            {status === 'locating' ? (
                                                <>
                                                    <LoaderCircle
                                                        className="size-4 animate-spin"
                                                        aria-hidden="true"
                                                    />
                                                    Finding you…
                                                </>
                                            ) : (
                                                <>
                                                    <Navigation className="size-4" aria-hidden="true" />
                                                    Use my location
                                                </>
                                            )}
                                        </button>
                                        {(status === 'denied' || status === 'error' || status === 'unavailable') && (
                                            <p className="mt-4 text-sm text-white/55">
                                                Location is blocked. I can still open the outside
                                                maps app if you want the blue-dot navigation.
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                                            {destinationName}
                                        </p>
                                        <p className="mt-3 font-display text-3xl leading-tight">
                                            How do you want to go?
                                        </p>
                                        <ul className="mt-6 grid gap-2">
                                            {TRAVEL_MODE_ORDER.map((option) => {
                                                const config = TRAVEL_MODES[option]
                                                return (
                                                    <li key={option}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setMode(option)}
                                                            className="flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-left outline-none hover:border-amber-brand hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                                                        >
                                                            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-brand text-ink">
                                                                <config.icon
                                                                    className="size-4"
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                            <span>
                                                                <span className="block text-sm font-semibold">
                                                                    {config.label}
                                                                </span>
                                                                <span className="block text-xs text-white/55">
                                                                    {config.hint}
                                                                </span>
                                                            </span>
                                                        </button>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <BuddyMapRide
                            origin={coords}
                            destination={destination}
                            destinationName={destinationName}
                            mode={mode}
                            originLabel="from where you are"
                            onArrived={() => setFinished(true)}
                            onSkip={() => setFinished(true)}
                            className="h-full w-full"
                        />
                    )}
                    </div>,
                    document.body
                )}
        </>
    )
}
