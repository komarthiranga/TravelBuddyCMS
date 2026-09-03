'use client'

import { Navigation } from 'lucide-react'

import { useLocation } from '@/site/components/location-provider'
import { distanceKm, formatDistance, toCoords, travelSummary } from '@/site/lib/geo'

/**
 * Renders how far a place is from the visitor. Nothing is shown until the
 * browser has given us a position, so this is inert for anyone who declines.
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
    const { coords } = useLocation()
    const target = toCoords(latitude, longitude)

    if (!coords || !target) return null

    const km = distanceKm(coords, target)

    if (variant === 'detailed') {
        return (
            <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    tone === 'night'
                        ? 'border border-white/20 bg-white/10 text-white backdrop-blur-md'
                        : 'bg-white text-ink shadow-card'
                } ${className}`}
            >
                <Navigation
                    className={`size-4 ${tone === 'night' ? 'text-amber-brand' : 'text-teal-brand'}`}
                    aria-hidden="true"
                />
                {formatDistance(km)} away
                <span
                    className={`font-normal ${tone === 'night' ? 'text-white/60' : 'text-ink-soft/60'}`}
                >
                    · {travelSummary(km)}
                </span>
            </span>
        )
    }

    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-semibold text-teal-brand-dark ${className}`}
        >
            <Navigation className="size-3" aria-hidden="true" />
            {formatDistance(km)} away
        </span>
    )
}
