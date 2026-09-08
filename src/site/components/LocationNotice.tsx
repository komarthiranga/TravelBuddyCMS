'use client'

import { LoaderCircle, MapPin, Navigation } from 'lucide-react'

import { useLocation } from '@/site/components/location-provider'

export function LocationNotice({
    tone = 'day',
    className = '',
}: {
    tone?: 'day' | 'night'
    className?: string
}) {
    const { startPoint, cityCentre, status, request, chooseCentre } = useLocation()

    if (startPoint?.kind === 'user') return null

    const cityName = cityCentre?.name ?? 'the city'
    const fromCentre = startPoint?.kind === 'centre'
    const locating = status === 'locating'
    const onDark = tone === 'night'

    return (
        <div
            role="status"
            className={`rounded-2xl border px-4 py-4 sm:px-5 ${
                onDark
                    ? 'border-white/25 bg-ink text-white'
                    : 'border-ink/15 bg-white text-ink shadow-card'
            } ${className}`}
        >
            <p className="text-base font-semibold leading-snug">
                {fromCentre
                    ? `Location unavailable. Distances are currently measured from ${cityName} city centre.`
                    : `Location is off. Distances and directions wait until you choose a starting point.`}
            </p>
            {!fromCentre && cityCentre && (
                <p className={`mt-1 text-base ${onDark ? 'text-white/80' : 'text-ink-soft'}`}>
                    You can use your location, or start from {cityName} city centre.
                </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={request}
                    disabled={locating || status === 'unavailable'}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-base font-semibold outline-none disabled:opacity-40 focus-visible:ring-2 ${
                        onDark
                            ? 'bg-amber-brand text-ink hover:bg-amber-brand-dark hover:text-white focus-visible:ring-white'
                            : 'bg-ink text-white hover:bg-ink-soft focus-visible:ring-teal-brand'
                    }`}
                >
                    {locating ? (
                        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <Navigation className="size-4" aria-hidden="true" />
                    )}
                    Use my location
                </button>
                {cityCentre && !fromCentre && (
                    <button
                        type="button"
                        onClick={chooseCentre}
                        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 text-base font-semibold outline-none focus-visible:ring-2 ${
                            onDark
                                ? 'border-white/40 text-white hover:bg-white/10 focus-visible:ring-white'
                                : 'border-ink/20 text-ink hover:bg-cream focus-visible:ring-teal-brand'
                        }`}
                    >
                        <MapPin className="size-4" aria-hidden="true" />
                        Choose starting point
                    </button>
                )}
            </div>
        </div>
    )
}
