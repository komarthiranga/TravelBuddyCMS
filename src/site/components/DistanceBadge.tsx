'use client'

import { Navigation } from 'lucide-react'

import { useLocation } from '@/site/components/location-provider'
import { distanceKm, formatDistance, toCoords, travelSummary } from '@/site/lib/geo'

/**
 * How far a place is from the confirmed starting point. Nothing is shown
 * until the visitor has shared a location or chosen the city centre.
 */
export function DistanceBadge({
    latitude,
    longitude,
    variant = 'compact',
    tone = 'day',
    className = '',
}: {
    latitude: string | number | null
    longitude: string | number | null
    variant?: 'compact' | 'detailed'
    tone?: 'day' | 'night'
    className?: string
}) {
    const { startPoint } = useLocation()
    const target = toCoords(latitude, longitude)

    if (!startPoint || !target) return null

    const km = distanceKm(startPoint.coords, target)
    const fromCentre = startPoint.kind === 'centre'
    const label = fromCentre
        ? `${formatDistance(km)} from ${startPoint.label}`
        : `${formatDistance(km)} away`

    if (variant === 'detailed') {
        return (
            <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold ${
                    tone === 'night'
                        ? 'border border-white/20 bg-white/10 text-white backdrop-blur-md'
                        : 'bg-white text-ink shadow-card'
                } ${className}`}
            >
                <Navigation
                    className={`size-4 ${tone === 'night' ? 'text-amber-brand' : 'text-teal-brand'}`}
                    aria-hidden="true"
                />
                {label}
                <span
                    className={`font-normal ${tone === 'night' ? 'text-white/80' : 'text-ink-soft'}`}
                >
                    · {travelSummary(km)}
                </span>
            </span>
        )
    }

    return (
        <span
            className={`inline-flex items-center gap-1 text-sm font-semibold text-teal-brand-dark ${className}`}
        >
            <Navigation className="size-3.5" aria-hidden="true" />
            {label}
        </span>
    )
}
