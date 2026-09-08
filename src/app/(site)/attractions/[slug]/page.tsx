import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Clock, MapPin } from 'lucide-react'

import { getNearbyAttractions } from '@/site/api/getNearbyAttractions'
import { getPublishedAttractionBySlug } from '@/site/api/getPublishedAttractionBySlug'
import { formatFee } from '@/site/components/AttractionCard'
import { DistanceBadge } from '@/site/components/DistanceBadge'
import { GuidedTour } from '@/site/components/GuidedTour'
import { LocationNotice } from '@/site/components/LocationNotice'
import { TakeMeThere } from '@/site/components/TakeMeThere'
import { formatDistance, isOpenNow, toCoords, travelSummary } from '@/site/lib/geo'
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
    walk: 'If you are already nearby, just follow your feet.',
    cycle: 'Two-wheelers weave through faster than anything else.',
    auto: 'Just say the name. Every driver here knows this place.',
    bus: 'State buses and locals both stop near enough to walk.',
    car: 'Drive in — parking is usually somewhere near the entrance.',
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
            line: mode ? MODE_LINES[mode] : 'Works fine from most parts of town.',
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
    const currentlyOpen = isOpenNow(attraction.opening_time, attraction.closing_time)

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

            <header className="relative isolate min-h-[52svh] overflow-hidden bg-ink text-white sm:min-h-[58svh]">
                {hero ? (
                    <Image
                        src={hero.image_url}
                        alt={hero.alt_text ?? attraction.short_name}
                        fill
                        preload
                        sizes="100vw"
                        className="object-cover"
                    />
                ) : (
                    <div aria-hidden="true" className="absolute inset-0 grain" />
                )}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20"
                />

                <div className="relative mx-auto flex min-h-[52svh] w-full max-w-6xl flex-col justify-between px-5 py-6 sm:min-h-[58svh] sm:px-8 sm:py-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <Link
                            href="/attractions"
                            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-base font-medium text-white outline-none backdrop-blur-md hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <MapPin className="size-3.5" aria-hidden="true" />
                            Back to {attraction.city_name}
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
                        <h1 className="mt-2 font-display text-4xl leading-[1.05] sm:text-6xl">
                            {attraction.short_name}
                        </h1>
                        <p className="mt-3 flex items-start gap-2 text-base text-white/85">
                            <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
                            {attraction.address}
                        </p>
                    </div>
                </div>
            </header>

            <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
                <LocationNotice className="mb-6" />

                <ul className="grid gap-3 sm:grid-cols-3">
                    <li className="rounded-2xl border border-hairline bg-white px-4 py-4">
                        <p className="text-sm font-semibold text-ink-soft">Open now</p>
                        <p className="mt-1 flex items-center gap-2 text-base font-semibold text-ink">
                            <Clock className="size-4 text-teal-brand-dark" aria-hidden="true" />
                            {hoursLabel
                                ? currentlyOpen
                                    ? `Open · ${hoursLabel}`
                                    : `Closed · ${hoursLabel}`
                                : 'Hours not listed'}
                        </p>
                    </li>
                    <li className="rounded-2xl border border-hairline bg-white px-4 py-4">
                        <p className="text-sm font-semibold text-ink-soft">Entry fee</p>
                        <p className="mt-1 text-base font-semibold text-ink">{feeLabel}</p>
                    </li>
                    <li className="rounded-2xl border border-hairline bg-white px-4 py-4">
                        <p className="text-sm font-semibold text-ink-soft">Distance</p>
                        <div className="mt-1 text-base font-semibold text-ink">
                            <DistanceBadge
                                latitude={attraction.latitude}
                                longitude={attraction.longitude}
                            />
                        </div>
                    </li>
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                    <TakeMeThere
                        destination={origin}
                        destinationName={attraction.short_name}
                        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-brand px-6 text-base font-semibold text-ink outline-none hover:bg-amber-brand-dark hover:text-white disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-teal-brand"
                    />
                    <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center rounded-full border border-ink/15 bg-white px-6 text-base font-semibold text-ink outline-none hover:bg-cream focus-visible:ring-2 focus-visible:ring-teal-brand"
                    >
                        Open map pin
                    </a>
                </div>

                <section className="mt-12">
                    <h2 className="font-display text-3xl text-ink">Why visit</h2>
                    <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink-soft">
                        {storyParagraphs.map((paragraph, index) => (
                            <p key={index} className="whitespace-pre-line">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </section>

                {tipLines.length > 0 && (
                    <section className="mt-12">
                        <h2 className="font-display text-3xl text-ink">Good to know</h2>
                        <ul className="mt-4 space-y-3">
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
                        <h2 className="font-display text-3xl text-ink">Practical bits</h2>
                        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                            {attraction.best_time_to_visit && (
                                <div className="rounded-2xl border border-hairline bg-white px-4 py-4">
                                    <dt className="text-sm font-semibold text-ink-soft">
                                        Best visiting time
                                    </dt>
                                    <dd className="mt-1 text-base text-ink">
                                        {attraction.best_time_to_visit}
                                    </dd>
                                </div>
                            )}
                            <div className="rounded-2xl border border-hairline bg-white px-4 py-4">
                                <dt className="text-sm font-semibold text-ink-soft">
                                    Type of place
                                </dt>
                                <dd className="mt-1 text-base text-ink">{attraction.category_name}</dd>
                            </div>
                        </dl>
                    </section>
                )}

                {nearby.length > 0 && (
                    <section className="mt-12">
                        <h2 className="font-display text-3xl text-ink">Nearby places</h2>
                        <ul className="mt-4 space-y-3">
                            {nearby.map((place) => (
                                <li key={place.id}>
                                    <Link
                                        href={`/attractions/${place.slug}`}
                                        className="group flex min-h-12 gap-4 rounded-2xl border border-hairline bg-white p-3 outline-none hover:shadow-card focus-visible:ring-2 focus-visible:ring-teal-brand"
                                    >
                                        <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-teal-wash">
                                            {place.primary_image ? (
                                                <Image
                                                    src={place.primary_image}
                                                    alt={place.primary_image_alt ?? place.short_name}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="flex size-full items-center justify-center">
                                                    <MapPin
                                                        className="size-5 text-teal-brand/40"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            )}
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
                                                    {formatDistance(place.km)} from here ·{' '}
                                                    {travelSummary(place.km)}
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
                    <section className="mt-12">
                        <h2 className="font-display text-3xl text-ink">Photos</h2>
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
