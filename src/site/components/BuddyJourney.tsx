'use client'

import { useMemo, useRef, useState } from 'react'
import { PlaceImage } from './PlaceImage'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Compass, MapPin, Search } from 'lucide-react'
import type { JourneyPlace } from '@/site/api/getPlacesForJourney'
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
    const [category, setCategory] = useState<number | null>(null)
    const [query, setQuery] = useState('')
    const categories = Array.from(new Map(places.map(place => [place.category_id, place.category_name])))
    const cityName = cities[0]?.name ?? (te ? 'ఈ నగరం' : 'the city')
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
    const visible = ordered.filter(({place}) => (!category || place.category_id === category) && `${place.short_name} ${place.category_name}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    function focusStep() {
        requestAnimationFrame(() => heading.current?.focus())
    }
    return (
        <section
            lang={locale}
            aria-labelledby="journey-heading"
            className="min-h-[75vh] bg-cream pb-16 pt-6 sm:pt-8"
        >
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
                    <div>
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-teal-brand-dark"><Compass className="size-4" aria-hidden="true" />{te ? 'మీ స్థానిక గైడ్' : `Your local guide · ${cityName}`}</p>
                        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">{te ? 'ఈ రోజు ఎక్కడికి వెళ్దాం?' : 'Where shall we go today?'}</h1>
                        <p className="mt-2 text-sm text-ink-soft">{te ? 'ఒక ప్రదేశాన్ని ఎంచుకోండి. అక్కడికి వెళ్లే దారిని చూద్దాం.' : 'Pick a place. Find your way. Make the day yours.'}</p>
                    </div>
                    <Link href="/attractions" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-white px-4 text-sm font-semibold text-ink hover:bg-teal-wash focus-visible:outline-2 focus-visible:outline-teal-brand">{te ? 'అన్ని వివరాలు' : 'Browse place details'}<ArrowRight className="size-4" aria-hidden="true" /></Link>
                </header>
                <TranslationNotice />
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-ink">{te ? 'ప్రదేశాన్ని కనుగొనండి' : 'Find your next stop'}</h2>
                        <div className="mt-3 flex flex-col-reverse gap-3">
                            <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label={te ? 'ప్రదేశం రకం' : 'Filter places by category'}>
                                {[[null, te ? 'అన్నీ' : 'All places'], ...categories].map(([id, name]) => <button key={String(id)} type="button" aria-pressed={category === id} onClick={() => setCategory(id as number | null)} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-teal-brand ${category === id ? 'border-teal-brand bg-teal-brand text-white' : 'border-hairline text-ink hover:bg-teal-wash'}`}>{name}</button>)}
                            </div>
                            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-hairline px-3 focus-within:ring-2 focus-within:ring-teal-brand">
                                <Search className="size-5 text-ink-soft" aria-hidden="true" /><span className="sr-only">{te ? 'ప్రదేశం వెతకండి' : 'Find a place for your visit'}</span>
                                <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={te ? 'ప్రదేశం లేదా రకం వెతకండి' : 'Search a place or category'} className="min-h-12 w-full bg-transparent text-base outline-none" />
                            </label>
                        </div>
                        {places.length > 0 && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft"><p role="status">{visible.length} {te ? 'ప్రదేశాలు' : 'places to explore'}</p><span>{startPoint ? (te ? 'దగ్గరి ప్రదేశాలు ముందుగా' : 'Nearest first · straight-line distance') : (te ? 'ప్రారంభ స్థానం తర్వాత ఎంచుకోవచ్చు' : 'Select a place to plan your visit')}</span></div>}
                        {ordered.length === 0 && (
                            <p className="mt-5 text-ink">
                                {te
                                    ? 'ఇక్కడ ప్రదేశాల సమాచారం ఇంకా లేదు. మరో నగరాన్ని ఎంచుకోండి.'
                                    : 'We’re still adding places here. Please choose another city.'}
                            </p>
                        )}
                        <ul className="mt-3 space-y-3">
                            {visible.map(({ place, km }) => (
                                <li
                                    key={place.id}
                                    className={`flex gap-3 rounded-2xl border p-3 transition-colors sm:gap-4 ${selectedId === place.id ? 'border-teal-brand bg-teal-wash' : 'border-hairline bg-white hover:border-teal-brand/50'}`}
                                >
                                    <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-teal-wash sm:h-36 sm:w-36">
                                        <PlaceImage src={place.primary_image} alt={place.primary_image_alt} name={place.short_name} category={place.category_name} sizes="(max-width: 640px) 96px, 144px" compact />

                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                    <p className="text-xs font-semibold text-teal-brand-dark">{place.category_name}</p>
                                    <h3
                                        lang="en"
                                        className="mt-1 text-base font-semibold text-ink sm:text-lg"
                                    >
                                        {place.short_name}
                                    </h3>
                                    <p
                                        lang="en"
                                        className="mt-1 hidden line-clamp-2 text-sm leading-relaxed text-ink-soft sm:block"
                                    >
                                        {place.short_description}
                                    </p>
                                    <p className="mt-2 text-xs text-ink-soft">
                                        {km !== null
                                            ? `${formatDistance(km)} · ${te ? 'నేరుగా దూరం' : 'straight-line distance'}`
                                            : te
                                              ? 'దూరం కోసం ప్రారంభ స్థానం ఎంచుకోండి'
                                              : cityName}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedId(place.id)
                                            setMode(null)
                                            focusStep()
                                        }}
                                        aria-pressed={selectedId === place.id} className="mt-auto inline-flex min-h-11 items-center justify-between gap-2 rounded-lg text-left text-sm font-semibold text-teal-brand-dark focus-visible:outline-2 focus-visible:outline-teal-brand"
                                    >
                                        {te
                                            ? 'ఈ ప్రదేశాన్ని ఎంచుకోండి'
                                            : selectedId === place.id ? 'Selected for your visit' : 'Plan a visit'}
                                        <ArrowRight
                                            className="size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                    </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {ordered.length > 0 && visible.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-hairline bg-white p-8 text-center"><p className="text-ink-soft">{te ? 'ఈ ఎంపికలకు ప్రదేశాలు లేవు.' : 'No places match just yet. Try another category or name.'}</p><button onClick={() => { setCategory(null); setQuery('') }} className="mt-3 min-h-11 rounded-lg px-4 font-semibold text-teal-brand-dark underline focus-visible:outline-2 focus-visible:outline-teal-brand">{te ? 'ఫిల్టర్లు తొలగించండి' : 'Show all places'}</button></div>}
                    </div>
                    <div className="min-w-0 lg:sticky lg:top-6">
                        <h2 id="journey-heading" ref={heading} tabIndex={-1} className="mb-3 text-lg font-semibold text-ink focus:outline-none">{te ? 'మీ సందర్శన' : 'Your visit'}</h2>
                        {!selected ? <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
                            <div className="relative aspect-[2/1] bg-teal-wash"><PlaceImage name="your next outing" category="Explore" sizes="(max-width: 1024px) 90vw, 480px" /></div>
                            <div className="p-6">
                                <h3 className="font-display text-2xl text-ink">{te ? 'మంచి ప్రదేశంతో మొదలుపెడదాం.' : 'Every good day starts somewhere.'}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{te ? 'జాబితాలోని ప్రదేశాన్ని ఎంచుకోండి. ప్రయాణ వివరాలు ఇక్కడ కనిపిస్తాయి.' : 'Choose “Plan a visit” beside a place. We’ll put the practical details here, so you can head out with confidence.'}</p>
                                <ol className="mt-6 space-y-4 text-sm text-ink-soft">{(te ? ['ఒక ప్రదేశాన్ని ఎంచుకోండి', 'ప్రారంభ స్థానం ఎంచుకోండి', 'ప్రయాణ విధానం, దిశలు'] : ['A place you want to see', 'A starting point that suits you', 'Transport and directions']).map((label, index) => <li key={label} className="flex items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-wash text-xs font-semibold text-teal-brand-dark">{index + 1}</span>{label}</li>)}</ol>
                            </div>
                        </div> : <>
                        <aside aria-label={te ? 'ఎంచుకున్న ప్రదేశం' : 'Your chosen place'} className="rounded-t-2xl border border-hairline bg-white p-4">
                            <div className="relative mb-4 aspect-[2/1] overflow-hidden rounded-xl">
                                <PlaceImage src={selected.primary_image} alt={selected.primary_image_alt}
                                    name={selected.short_name} category={selected.category_name} sizes="(max-width: 1024px) 90vw, 480px" />
                            </div>
                            <h3 lang="en" className="font-display text-2xl">
                                {selected.short_name}
                            </h3>
                            <p
                                lang="en"
                                className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft"
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
                            <p className="mt-2 flex items-start gap-2 text-sm text-ink-soft"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{selected.address}</p>
                        </aside>
                        <div className="rounded-b-2xl border border-t-0 border-hairline bg-white p-4 sm:p-5">
                        <h3 className="text-lg font-semibold text-ink">{te ? 'ఎక్కడి నుండి బయలుదేరుతారు?' : 'Start from somewhere familiar'}</h3>
                        <p className="mt-2 text-sm text-ink-soft">{te ? 'మీ స్థానం లేదా నగర కేంద్రాన్ని ఎంచుకోండి.' : 'Use your location, or choose the city centre. Either works.'}</p>
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
                        </>}
                    </div>
                </div>
            </div>
        </section>
    )
}
