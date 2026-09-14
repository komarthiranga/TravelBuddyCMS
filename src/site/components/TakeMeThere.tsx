'use client'

import { useState, type ReactNode } from 'react'
import { ExternalLink, Navigation } from 'lucide-react'
import { AccessibleDialog } from './AccessibleDialog'
import { LocationNotice } from './LocationNotice'
import { useChrome } from './locale-provider'
import { useLocation } from './location-provider'
import type { Coords } from '@/site/lib/geo'
import { distanceKm, formatDistance, formatDuration } from '@/site/lib/geo'
import { googleMapsDirUrl, recommendMode } from '@/site/lib/maps'
import {
    minutesFor,
    TRAVEL_MODES,
    type TravelMode,
} from '@/site/lib/travelModes'

export const MODE_TE: Record<TravelMode, string> = {
    walk: 'నడక',
    cycle: 'సైకిల్',
    auto: 'ఆటో',
    bus: 'బస్సు',
    car: 'కారు',
}

export function TakeMeThere({
    destination,
    destinationName,
    className,
    children,
}: {
    destination: Coords | null
    destinationName: string
    className?: string
    children?: ReactNode
}) {
    const { startPoint } = useLocation()
    const { locale } = useChrome()
    const te = locale === 'te'
    const [open, setOpen] = useState(false)
    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={!destination}
                className={className}
            >
                {children ?? (
                    <>
                        <Navigation className="size-4" aria-hidden="true" />
                        <span lang={locale}>
                            {te ? 'దారి చూపించండి' : 'Get directions'}
                        </span>
                    </>
                )}
            </button>
            {open && destination && (
                <AccessibleDialog
                    label={
                        te ? 'ప్రయాణ దిశలు' : `Directions to ${destinationName}`
                    }
                    onClose={() => setOpen(false)}
                >
                    {startPoint ? (
                        <DirectionsSummary
                            origin={startPoint.coords}
                            originLabel={startPoint.label}
                            fromCentre={startPoint.kind === 'centre'}
                            destination={destination}
                            destinationName={destinationName}
                        />
                    ) : (
                        <div lang={locale}>
                            <h2 className="font-display text-2xl">
                                {te
                                    ? 'ఎక్కడి నుండి బయలుదేరుతారు?'
                                    : 'Where would you like to start?'}
                            </h2>
                            <LocationNotice className="mt-4" />
                        </div>
                    )}
                </AccessibleDialog>
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
    const { locale } = useChrome()
    const te = locale === 'te'
    const km = distanceKm(origin, destination)
    const mode = forcedMode ?? recommendMode(km)
    return (
        <div lang={locale}>
            <p className="text-sm font-semibold text-teal-brand-dark">
                {te ? 'ప్రయాణ దిశలు' : 'Directions'}
            </p>
            <h2
                lang="en"
                className="mt-2 font-display text-2xl leading-tight sm:text-3xl"
            >
                {destinationName}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
                {fromCentre
                    ? te
                        ? 'నగర కేంద్రం నుండి'
                        : `Starting from ${originLabel}`
                    : te
                      ? 'మీరు ఎంచుకున్న స్థానం నుండి'
                      : 'Starting from your saved location'}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-hairline bg-white p-4">
                    <dt className="text-sm text-ink-soft">
                        {te ? 'నేరుగా దూరం' : 'Straight-line distance'}
                    </dt>
                    <dd className="mt-1 text-lg font-semibold">
                        {formatDistance(km)}
                    </dd>
                </div>
                <div className="rounded-2xl border border-hairline bg-white p-4">
                    <dt className="text-sm text-ink-soft">
                        {te ? 'ప్రయాణ విధానం' : 'Travel by'}
                    </dt>
                    <dd className="mt-1 text-lg font-semibold">
                        {te ? MODE_TE[mode] : TRAVEL_MODES[mode].label}
                    </dd>
                </div>
            </dl>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
                {mode === 'bus'
                    ? te
                        ? 'బస్సు మార్గాలు, సమయాలు ఇంకా నిర్ధారించలేదు. మ్యాప్స్‌లో తనిఖీ చేయండి.'
                        : 'Bus services and waiting times are not verified. Check available routes in Maps.'
                    : te
                      ? `సుమారు ${formatDuration(minutesFor(km, mode))}. ఇది అంచనా మాత్రమే; అసలు మార్గం, ట్రాఫిక్ ఆధారంగా సమయం మారవచ్చు.`
                      : `Rough estimate: ${formatDuration(minutesFor(km, mode))}. The actual route may be longer; traffic and waiting time are not included.`}
            </p>
            <a
                href={googleMapsDirUrl(origin, destination, mode)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl buddy-primary px-5 py-3 text-center font-semibold focus-visible:outline-2 focus-visible:outline-teal-brand"
            >
                <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                {te ? 'Google Mapsలో తెరవండి' : 'Open in Google Maps'}
            </a>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {te
                    ? 'కొత్త ట్యాబ్ లేదా మ్యాప్స్ యాప్ తెరుచుకుంటుంది. మీ ప్రారంభ స్థానం, గమ్యం Googleతో పంచుకోబడతాయి.'
                    : 'Opens a new tab or the Maps app. Your starting point and destination will be shared with Google.'}
            </p>
            {onContinue && (
                <button
                    type="button"
                    onClick={onContinue}
                    className="mt-4 min-h-12 w-full rounded-xl border border-ink/20 px-4 font-semibold focus-visible:outline-2 focus-visible:outline-teal-brand"
                >
                    {continueLabel}
                </button>
            )}
        </div>
    )
}
