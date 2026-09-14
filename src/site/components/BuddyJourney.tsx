'use client'

import { useMemo, useRef, useState } from 'react'
import { PlaceImage } from './PlaceImage'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { JourneyPlace } from '@/site/api/getPlacesForJourney'
import { BuddyMascot } from './BuddyMascot'
import { useLocation } from './location-provider'
import { useChrome } from './locale-provider'
import { LocationNotice } from './LocationNotice'
import { TranslationNotice } from './LocalText'
import { DirectionsSummary, MODE_TE } from './TakeMeThere'
import { distanceKm, formatDistance, toCoords } from '@/site/lib/geo'
import {
    TRAVEL_MODE_ORDER,
    TRAVEL_MODES,
    type TravelMode,
} from '@/site/lib/travelModes'

export type JourneyCity = {
    id: number
    name: string
    state: string
    country: string
    latitude: string | null
    longitude: string | null
}

export function BuddyJourney({
    cities,
    places,
}: {
    cities: JourneyCity[]
    places: JourneyPlace[]
}) {
    const { locale } = useChrome()
    const te = locale === 'te'
    const { startPoint } = useLocation()
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [mode, setMode] = useState<TravelMode | null>(null)
    const heading = useRef<HTMLHeadingElement>(null)
    const selected = places.find((place) => place.id === selectedId)
    const destination = selected
        ? toCoords(selected.latitude, selected.longitude)
        : null
    const ordered = useMemo(
        () =>
            places
                .map((place) => {
                    const coords = toCoords(place.latitude, place.longitude)
                    return {
                        place,
                        km:
                            startPoint && coords
                                ? distanceKm(startPoint.coords, coords)
                                : null,
                    }
                })
                .sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity)),
        [places, startPoint],
    )
    function focusStep() {
        requestAnimationFrame(() => heading.current?.focus())
    }
    return (
        <section
            lang={locale}
            aria-labelledby="journey-heading"
            className="border-y border-hairline bg-teal-wash py-8 sm:py-12"
        >
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <div className="flex items-center gap-4">
                    <BuddyMascot pose="talk" className="h-16 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-teal-brand-dark">
                            {te
                                ? 'మీ ప్రయాణ సహాయకుడు'
                                : 'A little help from Buddy'}
                        </p>
                        <h2
                            id="journey-heading"
                            ref={heading}
                            tabIndex={-1}
                            className="mt-1 font-display text-3xl leading-tight text-ink focus:outline-none"
                        >
                            {selected
                                ? mode
                                    ? te
                                        ? 'ప్రయాణానికి సిద్ధమా?'
                                        : 'Ready to find your way?'
                                    : te
                                      ? 'ఎలా వెళ్లాలనుకుంటున్నారు?'
                                      : 'How would you like to get there?'
                                : te
                                  ? 'ముందుగా ఒక ప్రదేశాన్ని ఎంచుకోండి'
                                  : 'Let’s choose a place first'}
                        </h2>
                    </div>
                </div>
                <div className="mt-5">
                    <p className="text-base text-ink-soft">
                        {te
                            ? 'ప్రదేశం → ప్రయాణ విధానం → దిశలు'
                            : 'Choose a place → Choose transport → Get directions'}
                    </p>
                    <TranslationNotice />
                </div>
                {!selected ? (
                    <>
                        <p className="mt-3 text-base text-ink-soft">
                            {te
                                ? `${cities[0]?.name ?? ''}లో చూడదగిన ప్రదేశాలు. స్థానం ఎంచుకుంటే దగ్గరి ప్రదేశాలు ముందుగా కనిపిస్తాయి.`
                                : `Explore ${cities[0]?.name ?? 'the city'} at your own pace. Choose a starting point to see the nearest places first.`}
                        </p>
                        <LocationNotice className="mt-4" />
                        {ordered.length === 0 && (
                            <p className="mt-5 text-ink">
                                {te
                                    ? 'ఇక్కడ ప్రదేశాల సమాచారం ఇంకా లేదు. మరో నగరాన్ని ఎంచుకోండి.'
                                    : 'We’re still adding places here. Please choose another city.'}
                            </p>
                        )}
                        <ul className="mt-5 grid gap-4 md:grid-cols-3">
                            {ordered.map(({ place, km }) => (
                                <li
                                    key={place.id}
                                    className="flex flex-col rounded-2xl border border-hairline bg-white p-5"
                                >
                                    <h3
                                        lang="en"
                                        className="font-display text-xl text-ink"
                                    >
                                        {place.short_name}
                                    </h3>
                                    <p
                                        lang="en"
                                        className="mt-2 flex-1 text-base leading-relaxed text-ink-soft"
                                    >
                                        {place.short_description}
                                    </p>
                                    <p className="mt-3 text-sm font-semibold text-teal-brand-dark">
                                        {km !== null
                                            ? `${formatDistance(km)} · ${te ? 'నేరుగా దూరం' : 'straight-line distance'}`
                                            : te
                                              ? 'దూరం కోసం ప్రారంభ స్థానం ఎంచుకోండి'
                                              : 'Choose a starting point for distance'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedId(place.id)
                                            setMode(null)
                                            focusStep()
                                        }}
                                        className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 font-semibold text-white focus-visible:outline-2 focus-visible:outline-teal-brand"
                                    >
                                        {te
                                            ? 'ఈ ప్రదేశాన్ని ఎంచుకోండి'
                                            : 'Choose this place'}
                                        <ArrowRight
                                            className="size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <div className="mt-5 max-w-3xl">
                        <div className="rounded-2xl border border-hairline bg-white p-5">
                            <div className="relative mb-4 aspect-[3/1] overflow-hidden rounded-xl">
                                <PlaceImage src={selected.primary_image} alt={selected.primary_image_alt}
                                    name={selected.short_name} category={selected.category_name} sizes="(max-width: 768px) 90vw, 720px" />
                            </div>
                            <h3 lang="en" className="font-display text-2xl">
                                {selected.short_name}
                            </h3>
                            <p
                                lang="en"
                                className="mt-2 text-base leading-relaxed text-ink-soft"
                            >
                                {selected.short_description}
                            </p>
                            <Link
                                href={`/attractions/${selected.slug}`}
                                className="mt-2 inline-flex min-h-12 items-center font-semibold text-teal-brand-dark underline underline-offset-4"
                            >
                                {te
                                    ? 'ధర, సమయాలు, వివరాలు'
                                    : 'View fees, hours and visiting tips'}
                            </Link>
                        </div>
                        <LocationNotice className="mt-4" />
                        {!destination ? (
                            <p className="mt-4">
                                {te
                                    ? 'ఈ ప్రదేశానికి దిశలు ఇంకా అందుబాటులో లేవు.'
                                    : 'Directions are not available for this place yet. Open its details for the address.'}
                            </p>
                        ) : mode && startPoint ? (
                            <div className="mt-4 rounded-2xl border border-hairline bg-white p-5">
                                <DirectionsSummary
                                    destination={destination}
                                    destinationName={selected.short_name}
                                    origin={startPoint.coords}
                                    originLabel={startPoint.label}
                                    fromCentre={startPoint.kind === 'centre'}
                                    mode={mode}
                                />
                            </div>
                        ) : (
                            <>
                                <p className="mt-5 text-base text-ink-soft">
                                    {te
                                        ? 'మీకు అనుకూలమైన విధానాన్ని ఎంచుకోండి. మార్గం, సేవల లభ్యతను మ్యాప్స్‌లో తనిఖీ చేయండి.'
                                        : 'Choose what suits you. Route suitability and local service availability need to be checked in Maps.'}
                                </p>
                                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {TRAVEL_MODE_ORDER.map((option) => {
                                        const Icon = TRAVEL_MODES[option].icon
                                        return (
                                            <li key={option}>
                                                <button
                                                    type="button"
                                                    disabled={!startPoint}
                                                    onClick={() => {
                                                        setMode(option)
                                                        focusStep()
                                                    }}
                                                    className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-ink/20 bg-white p-4 text-left text-ink disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-teal-brand"
                                                >
                                                    <Icon
                                                        className="size-5 shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                    <span>
                                                        <span className="block font-semibold">
                                                            {te
                                                                ? MODE_TE[
                                                                      option
                                                                  ]
                                                                : TRAVEL_MODES[
                                                                      option
                                                                  ].label}
                                                        </span>
                                                        {option === 'bus' && (
                                                            <span className="text-sm text-ink-soft">
                                                                {te
                                                                    ? 'సమయాలు నిర్ధారించలేదు'
                                                                    : 'Timetable not verified'}
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                if (mode) setMode(null)
                                else setSelectedId(null)
                                focusStep()
                            }}
                            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full px-3 font-semibold text-ink focus-visible:outline-2 focus-visible:outline-teal-brand"
                        >
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            {mode
                                ? te
                                    ? 'ప్రయాణ విధానం మార్చండి'
                                    : 'Change transport'
                                : te
                                  ? 'మరో ప్రదేశాన్ని ఎంచుకోండి'
                                  : 'Choose another place'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
