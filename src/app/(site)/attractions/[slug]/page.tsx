import { PlaceImage } from '@/site/components/PlaceImage'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Clock, MapPin } from 'lucide-react'

import { getNearbyAttractions } from '@/site/api/getNearbyAttractions'
import { getPublishedAttractionBySlug } from '@/site/api/getPublishedAttractionBySlug'
import { formatFee } from '@/site/components/AttractionCard'
import { LocalText, TranslationNotice } from '@/site/components/LocalText'
import { DistanceBadge } from '@/site/components/DistanceBadge'
import { SavePlaceButton } from '@/site/components/SavedPlaces'
import { GuidedTour } from '@/site/components/GuidedTour'
import { LocationNotice } from '@/site/components/LocationNotice'
import { TakeMeThere } from '@/site/components/TakeMeThere'
import { formatDistance, toCoords } from '@/site/lib/geo'
import { greetingForPlace } from '@/site/lib/greetings'
import { normaliseMode, TRAVEL_MODES, type TravelMode } from '@/site/lib/travelModes'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const data = await getPublishedAttractionBySlug(slug)
    if (!data) return { title: 'Not found — TravelBuddy' }

    const { attraction, images } = data
    return {
        title: `${attraction.short_name}, ${attraction.city_name} — TravelBuddy`,
        description: attraction.short_description,
        alternates: { canonical: `/attractions/${attraction.slug}` },
        openGraph: {
            type: 'article',
            title: attraction.short_name,
            description: attraction.short_description,
            images: images[0] ? [images[0].image_url] : undefined,
        },
    }
}

const MODE_LINES: Record<TravelMode, string> = {
    walk: 'Check pedestrian access and crossings before walking.',
    cycle: 'Check the route and road conditions before cycling.',
    auto: 'Confirm the destination and agree the fare before you leave.',
    bus: 'Check local stops, service times and the final walking distance.',
    car: 'Check parking availability before driving there.',
}

function resolveTravelModes(rawModes: string[]) {
    const seen = new Set<string>()
    const modes: { mode: TravelMode | null; label: string; line: string }[] = []

    for (const raw of rawModes) {
        const mode = normaliseMode(raw)
        const key = mode ?? raw.trim().toLowerCase()
        if (!key || seen.has(key)) continue
        seen.add(key)
        modes.push({
            mode,
            label: mode ? TRAVEL_MODES[mode].label : raw,
            line: mode ? MODE_LINES[mode] : 'Confirm route availability before travelling.',
        })
    }

    return modes
}

function formatTime(value: string | null) {
    if (!value) return null
    const [rawHours, rawMinutes] = value.split(':')
    const hours = Number.parseInt(rawHours, 10)
    if (!Number.isInteger(hours)) return null
    return `${hours % 12 || 12}:${rawMinutes ?? '00'} ${hours >= 12 ? 'PM' : 'AM'}`
}

function safeJsonLd(value: unknown) {
    return JSON.stringify(value).replace(/</g, '\\u003c')
}

export default async function AttractionDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const data = await getPublishedAttractionBySlug(slug)
    if (!data) notFound()

    const { attraction, images } = data
    const origin = toCoords(attraction.latitude, attraction.longitude)
    const nearby = await getNearbyAttractions(attraction.id, attraction.city_id, origin, 3)

    const hero = images[0] ?? null
    const gallery = images.slice(1)

    const openingTime = formatTime(attraction.opening_time)
    const closingTime = formatTime(attraction.closing_time)
    const isFree = Number.parseFloat(attraction.entry_fee) === 0
    const feeLabel = formatFee(attraction.entry_fee, attraction.currency_code)
    const hoursLabel = openingTime && closingTime ? `${openingTime} – ${closingTime}` : null

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        origin ? `${origin.lat},${origin.lng}` : `${attraction.full_name}, ${attraction.address}`
    )}`

    const tipLines = (attraction.instructions ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

    const storyParagraphs = (attraction.full_description ?? attraction.short_description)
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)

    const greeting = greetingForPlace(attraction.city_state, attraction.city_country)
    const resolvedModes = resolveTravelModes(attraction.travel_modes)

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'TouristAttraction',
        name: attraction.full_name,
        description: attraction.short_description,
        image: images.map((image) => image.image_url),
        isAccessibleForFree: isFree,
        address: {
            '@type': 'PostalAddress',
            streetAddress: attraction.address,
            addressLocality: attraction.city_name,
            addressCountry: 'IN',
        },
        ...(origin
            ? { geo: { '@type': 'GeoCoordinates', latitude: origin.lat, longitude: origin.lng } }
            : {}),
    }

    return (
        <article className="bg-cream pb-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
            />

            <header className="relative isolate min-h-[28svh] overflow-hidden bg-ink text-white sm:min-h-[38svh]">
                <PlaceImage src={hero?.image_url} alt={hero?.alt_text} name={attraction.short_name}
                    category={attraction.category_name} eager sizes="100vw" />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20"
                />

                <div className="relative mx-auto flex min-h-[28svh] w-full max-w-6xl flex-col justify-between px-5 py-6 sm:min-h-[38svh] sm:px-8 sm:py-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <Link
                            href="/attractions"
                            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-base font-medium text-white outline-none backdrop-blur-md hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <MapPin className="size-3.5" aria-hidden="true" />
                            <LocalText en="Back to places" te="ప్రదేశాల జాబితాకు తిరిగి" />
                        </Link>
                        <span className="rounded-full bg-amber-brand px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
                            {attraction.category_name}
                        </span>
                    </div>

                    <div className="max-w-3xl pb-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
                            {attraction.city_name}
                            {isFree ? ' · Free entry' : ` · ${feeLabel}`}
                        </p>
                        <h1 className="mt-2 font-display text-3xl leading-tight sm:text-5xl">
                            {attraction.short_name}
                        </h1>
                        <p className="mt-3 flex items-start gap-2 text-base text-white/85">
                            <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
                            {attraction.address}
                        </p>
                    </div>
                </div>
            </header>
            {images.some(image => image.image_url.includes('/travel-buddy/commons/58884991-')) && (
                <details className="mx-auto max-w-6xl px-5 py-2 text-xs text-ink-soft sm:px-8">
                    <summary className="inline-flex min-h-11 cursor-pointer items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand">Photo credits</summary>
                    <p className="pb-3 leading-relaxed"><a className="underline" href="https://commons.wikimedia.org/wiki/File:Pedestrian_Bridge_in_Brudhavan_Gardens.jpg">Pedestrian Bridge in Brudhavan Gardens</a> by IM3847 (14 May 2017), <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Resized and cropped for display.</p>
                </details>
            )}


            <div className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8">
                <TranslationNotice />
                <div className="mb-6 flex flex-wrap gap-3">
                    <TakeMeThere
                        destination={origin}
                        destinationName={attraction.short_name}
                        className="inline-flex min-h-12 items-center gap-2 rounded-xl buddy-primary px-6 text-base font-semibold outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-teal-brand"
                    />
                    <SavePlaceButton place={{ id: attraction.id, name: attraction.short_name, slug: attraction.slug, city: attraction.city_name }} />
                    {!origin && <p className="w-full text-sm text-ink-soft"><LocalText en="Exact coordinates aren’t available. Use the address link below to find this place." te="ఖచ్చితమైన స్థానం అందుబాటులో లేదు. దిగువ చిరునామా లింక్ ఉపయోగించండి." /></p>}
                </div>

                <h2 className="mb-4 font-display text-2xl text-ink"><LocalText en="Your visit at a glance" te="మీ సందర్శన వివరాలు" /></h2>

                <ul className="grid gap-3 sm:grid-cols-3">
                    <li className="rounded-2xl border border-hairline bg-white px-4 py-4">
                        <p className="text-sm font-semibold text-ink-soft"><LocalText en="Opening hours" te="ప్రారంభ సమయాలు" /></p>
                        <p className="mt-1 flex items-center gap-2 text-base font-semibold text-ink">
                            <Clock className="size-4 text-teal-brand-dark" aria-hidden="true" />
                            {hoursLabel ?? <LocalText en="Opening hours unavailable" te="సమయాల సమాచారం అందుబాటులో లేదు" />}
                        </p>
                    </li>
                    <li className="rounded-2xl border border-hairline bg-white px-4 py-4">
                        <p className="text-sm font-semibold text-ink-soft"><LocalText en="Entry fee" te="ప్రవేశ రుసుము" /></p>
                        <p className="mt-1 text-base font-semibold text-ink">{isFree ? <LocalText en="Free entry" te="ఉచిత ప్రవేశం" /> : feeLabel}</p>
                    </li>
                    <li className="rounded-2xl border border-hairline bg-white px-4 py-4">
                        <p className="text-sm font-semibold text-ink-soft"><LocalText en="Distance" te="నేరుగా దూరం" /></p>
                        <div className="mt-1 text-base font-semibold text-ink">
                            <DistanceBadge
                                latitude={attraction.latitude}
                                longitude={attraction.longitude}
                            />
                        </div>
                    </li>
                </ul>


                <div className="mt-4 rounded-2xl border border-hairline bg-white p-4">
                    <p className="text-sm font-semibold text-ink-soft"><LocalText en="Location" te="ప్రదేశం" /></p>
                    <p lang="en" className="mt-1 text-base text-ink">{attraction.address}</p>
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded font-semibold text-teal-brand-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand"><LocalText en="View in Google Maps" te="Google Mapsలో చూడండి" /><ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only"><LocalText en="opens a new tab" te="కొత్త ట్యాబ్‌లో తెరుచుకుంటుంది" /></span></a>
                </div>
                {!hoursLabel && <p className="mt-3 text-sm leading-relaxed text-ink-soft"><LocalText en="Opening hours haven’t been added yet. Confirm them with the venue before making a special trip." te="సమయాల సమాచారం ఇంకా లేదు. వెళ్లే ముందు ప్రదేశ నిర్వాహకులతో నిర్ధారించుకోండి." /></p>}
                <details className="mt-4 rounded-xl border border-hairline p-4">
                    <summary className="min-h-11 cursor-pointer py-2 font-semibold text-teal-brand-dark focus-visible:outline-2 focus-visible:outline-teal-brand"><LocalText en="Set your starting point for distances" te="దూరాల కోసం ప్రారంభ స్థానాన్ని ఎంచుకోండి" /></summary>
                    <LocationNotice className="mt-3" />
                </details>
                <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-x-5 border-y border-hairline py-2 text-sm font-semibold text-teal-brand-dark">
                    <a href="#about" className="inline-flex min-h-11 items-center underline underline-offset-4"><LocalText en="About this place" te="ప్రదేశం గురించి" /></a>
                    {tipLines.length > 0 && <a href="#tips" className="inline-flex min-h-11 items-center underline underline-offset-4"><LocalText en="Before you go" te="వెళ్లే ముందు" /></a>}
                    {gallery.length > 0 && <a href="#photos" className="inline-flex min-h-11 items-center underline underline-offset-4"><LocalText en="Photos" te="ఫోటోలు" /></a>}
                </nav>

                <section id="about" className="mt-8 scroll-mt-6">
                    <h2 className="font-display text-3xl text-ink"><LocalText en="Why visit" te="ఎందుకు సందర్శించాలి" /></h2>
                    <div lang="en" className="mt-4 space-y-4 text-lg leading-relaxed text-ink-soft">
                        {storyParagraphs.map((paragraph, index) => (
                            <p key={index} className="whitespace-pre-line">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </section>

                {tipLines.length > 0 && (
                    <section id="tips" className="mt-8 scroll-mt-6 rounded-2xl bg-teal-wash p-5">
                        <h2 className="font-display text-3xl text-ink"><LocalText en="Before you go" te="తెలుసుకోవాల్సిన విషయాలు" /></h2>
                        <ul lang="en" className="mt-4 space-y-3">
                            {tipLines.map((line, index) => (
                                <li
                                    key={index}
                                    className="rounded-2xl border border-hairline bg-white px-4 py-3 text-base leading-relaxed text-ink"
                                >
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {(attraction.best_time_to_visit || resolvedModes.length > 0) && (
                    <section className="mt-12">
                        <h2 className="font-display text-3xl text-ink"><LocalText en="Visiting information" te="ఉపయోగకరమైన సమాచారం" /></h2>
                        <dl lang="en" className="mt-4 grid gap-3 sm:grid-cols-2">
                            {attraction.best_time_to_visit && (
                                <div className="rounded-2xl border border-hairline bg-white px-4 py-4">
                                    <dt className="text-sm font-semibold text-ink-soft">
                                        <LocalText en="Best visiting time" te="సందర్శించడానికి అనుకూల సమయం" />
                                    </dt>
                                    <dd className="mt-1 text-base text-ink">
                                        {attraction.best_time_to_visit}
                                    </dd>
                                </div>
                            )}
                            <div className="rounded-2xl border border-hairline bg-white px-4 py-4">
                                <dt className="text-sm font-semibold text-ink-soft">
                                    <LocalText en="Type of place" te="ప్రదేశం రకం" />
                                </dt>
                                <dd className="mt-1 text-base text-ink">{attraction.category_name}</dd>
                            </div>
                        </dl>
                    </section>
                )}

                {nearby.length > 0 && (
                    <section className="mt-12">
                        <h2 className="font-display text-3xl text-ink"><LocalText en="Nearby places" te="దగ్గరలోని ప్రదేశాలు" /></h2>
                        <ul lang="en" className="mt-4 space-y-3">
                            {nearby.map((place) => (
                                <li key={place.id}>
                                    <Link
                                        href={`/attractions/${place.slug}`}
                                        className="group flex min-h-12 gap-4 rounded-2xl border border-hairline bg-white p-3 outline-none hover:shadow-card focus-visible:ring-2 focus-visible:ring-teal-brand"
                                    >
                                        <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-teal-wash">
                                            <PlaceImage src={place.primary_image} alt={place.primary_image_alt}
                                                name={place.short_name} category={place.category_name} sizes="80px" compact />
                                        </span>
                                        <span className="flex min-w-0 flex-1 flex-col justify-center">
                                            <span className="text-sm font-medium text-teal-brand-dark">
                                                {place.category_name}
                                            </span>
                                            <span className="font-display text-lg text-ink">
                                                {place.short_name}
                                            </span>
                                            {place.km !== null && (
                                                <span className="mt-1 text-sm text-ink-soft">
                                                    {formatDistance(place.km)} · straight-line from this place
                                                </span>
                                            )}
                                        </span>
                                        <ArrowUpRight
                                            className="size-4 shrink-0 self-center text-ink-soft"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {gallery.length > 0 && (
                    <section id="photos" className="mt-8 scroll-mt-6">
                        <h2 className="font-display text-3xl text-ink"><LocalText en="Photos" te="ఫోటోలు" /></h2>
                        <ul className="mt-4 grid grid-cols-2 gap-3">
                            {gallery.map((image, index) => (
                                <li
                                    key={image.id}
                                    className={`relative overflow-hidden rounded-2xl bg-teal-wash ${
                                        index === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/3]'
                                    }`}
                                >
                                    <Image
                                        src={image.image_url}
                                        alt={image.alt_text ?? attraction.short_name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 640px"
                                        className="object-cover"
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <GuidedTour
                    name={attraction.short_name}
                    cityName={attraction.city_name}
                    greeting={greeting}
                    shortDescription={attraction.short_description}
                    storyParagraphs={storyParagraphs}
                    tips={tipLines}
                    travelModes={resolvedModes}
                    feeLabel={feeLabel}
                    isFree={isFree}
                    hours={hoursLabel}
                    bestTime={attraction.best_time_to_visit}
                    address={attraction.address}
                    mapUrl={mapUrl}
                    latitude={attraction.latitude}
                    longitude={attraction.longitude}
                    images={images.map((image) => ({
                        url: image.image_url,
                        alt: image.alt_text ?? attraction.short_name,
                    }))}
                />
            </div>
        </article>
    )
}
