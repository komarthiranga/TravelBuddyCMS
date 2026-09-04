import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Clock, MapPin, Navigation } from 'lucide-react'

import { getNearbyAttractions } from '@/site/api/getNearbyAttractions'
import { getPublishedAttractionBySlug } from '@/site/api/getPublishedAttractionBySlug'
import { formatFee } from '@/site/components/AttractionCard'
import { BuddyMascot } from '@/site/components/BuddyMascot'
import { BuddyGuide } from '@/site/components/BuddyGuide'
import { BuddyMark } from '@/site/components/BuddyMark'
import { BuddySay, WalkChapter } from '@/site/components/BuddyVoice'
import { DistanceBadge } from '@/site/components/DistanceBadge'
import { TakeMeThere } from '@/site/components/TakeMeThere'
import { formatDistance, toCoords, travelSummary } from '@/site/lib/geo'
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

/** How he describes each way of getting here. Keyed on the canonical mode,
 *  because `travel_modes` is free text in the CMS ("Auto, Bus, Car"). */
const MODE_LINES: Record<TravelMode, string> = {
    walk: 'If you are already nearby, just follow your feet.',
    cycle: 'Two-wheelers weave through faster than anything else.',
    auto: 'Just say the name. Every driver here knows this place.',
    bus: 'State buses and locals both stop near enough to walk.',
    car: 'Drive in — parking is usually somewhere near the entrance.',
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

    /* Only plain values here — this array crosses into a client component,
       and an icon component cannot be serialised. */
    const resolvedModes = attraction.travel_modes.map((raw) => {
        const mode = normaliseMode(raw)
        return {
            mode,
            label: mode ? TRAVEL_MODES[mode].label : raw,
            line: mode ? MODE_LINES[mode] : 'Works fine from most parts of town.',
        }
    })

    const hoursLabel = openingTime && closingTime ? `${openingTime} – ${closingTime}` : null

    let chapter = 1
    const storyStep = chapter++
    const directionStep = chapter++
    const tipsStep = tipLines.length > 0 ? chapter++ : null
    const factsStep = chapter++
    const nearbyStep = nearby.length > 0 ? chapter++ : null
    const galleryStep = gallery.length > 0 ? chapter++ : null

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
        <article className="bg-cream">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
            />

            {/* ── Full-bleed walk-up hero ─────────────────────────── */}
            <header className="relative isolate min-h-[88svh] overflow-hidden bg-ink text-white">
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
                    className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15"
                />

                <div className="relative mx-auto flex min-h-[88svh] w-full max-w-6xl flex-col justify-between px-5 py-8 sm:px-8 sm:py-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <Link
                            href="/attractions"
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white outline-none backdrop-blur-md transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <MapPin className="size-3.5" aria-hidden="true" />
                            Back to {attraction.city_name}
                        </Link>
                        <span className="rounded-full bg-amber-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink">
                            {attraction.category_name}
                        </span>
                    </div>

                    <div className="max-w-3xl pb-6">
                        <div className="mb-8 flex items-end gap-2 animate-buddy-rise">
                            <BuddyMascot
                                pose="wave"
                                title={`Your local buddy in ${attraction.city_name}`}
                                className="h-40 w-auto shrink-0 sm:h-52"
                            />
                            <BuddySay tone="night" showMark={false} className="mb-6">
                                <span lang={greeting.lang} className="font-semibold text-amber-brand">
                                    {greeting.hello}
                                </span>
                                {' — '}
                                that&apos;s how we say hello in {greeting.language}. I&apos;m your
                                buddy here in {attraction.city_name}, and I&apos;ll take you inside{' '}
                                {attraction.short_name} myself.
                            </BuddySay>
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                            {attraction.city_name}
                            {isFree ? ' · Free entry' : ` · ${feeLabel}`}
                        </p>
                        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                            {attraction.short_name}
                        </h1>
                        {attraction.full_name !== attraction.short_name && (
                            <p className="mt-3 text-lg text-white/55">{attraction.full_name}</p>
                        )}

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <TakeMeThere
                                destination={origin}
                                destinationName={attraction.short_name}
                                className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-6 py-3 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-white"
                            />
                            <DistanceBadge
                                latitude={attraction.latitude}
                                longitude={attraction.longitude}
                                variant="detailed"
                                tone="night"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Guided walk with the buddy ──────────────────────── */}
            <div className="mx-auto w-full max-w-3xl px-5 pt-14 sm:px-8 sm:pt-16">
                <BuddyGuide
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

            {/* ── The walk ────────────────────────────────────────── */}
            <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
                <div className="mb-12 flex items-center gap-3">
                    <BuddyMark float />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-brand">
                            Prefer to read it all?
                        </p>
                        <p className="font-display text-xl text-ink">
                            Here&apos;s everything, written out
                        </p>
                    </div>
                </div>

                {/* 1. Story */}
                <WalkChapter
                    step={storyStep}
                    aside="The vibe"
                    title={`So, ${attraction.short_name}…`}
                >
                    <div className="space-y-5">
                        {storyParagraphs.map((paragraph, index) => (
                            <p
                                key={index}
                                className={`whitespace-pre-line leading-relaxed text-ink-soft ${
                                    index === 0 ? 'text-lg' : 'text-base text-ink-soft/85'
                                }`}
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </WalkChapter>

                {/* 2. Directions */}
                <WalkChapter
                    step={directionStep}
                    aside="Directions"
                    title="How I'd get you there"
                >
                    <BuddySay className="mb-6">
                        Don&apos;t overthink it. Use the map pin, or pick the way that fits how
                        you&apos;re moving today.
                    </BuddySay>

                    <div className="overflow-hidden rounded-3xl border border-hairline bg-white">
                        <div className="border-b border-hairline bg-[linear-gradient(135deg,oklch(0.97_0.02_195),oklch(0.99_0.01_85))] px-6 py-5">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft/50">
                                Meet me at
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-ink">
                                {attraction.address}
                            </p>
                        </div>

                        {resolvedModes.length > 0 && (
                            <ul className="divide-y divide-hairline">
                                {resolvedModes.map((config, index) => {
                                    const Icon = config.mode
                                        ? TRAVEL_MODES[config.mode].icon
                                        : Navigation
                                    return (
                                        <li key={config.label} className="flex gap-4 px-6 py-4">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-amber-brand">
                                                <Icon className="size-4" aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="flex items-baseline gap-2">
                                                    <span className="font-display text-lg text-ink">
                                                        {config.label}
                                                    </span>
                                                    <span className="text-[11px] uppercase tracking-wider text-ink-soft/40">
                                                        Option {index + 1}
                                                    </span>
                                                </span>
                                                <span className="mt-0.5 block text-sm text-ink-soft/70">
                                                    {config.line}
                                                </span>
                                            </span>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}

                        <div className="border-t border-hairline p-4">
                            <a
                                href={mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-semibold text-white outline-none transition hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2"
                            >
                                <Navigation className="size-4" aria-hidden="true" />
                                Open turn-by-turn directions
                            </a>
                        </div>
                    </div>
                </WalkChapter>

                {/* 3. Local tips */}
                {tipsStep !== null && (
                    <WalkChapter
                        step={tipsStep}
                        aside="Local whisper"
                        title="Stuff I'd tell you before we go in"
                    >
                        <BuddySay tone="whisper" className="mb-6">
                            These are the bits guidebooks skip — the ones that actually save your
                            afternoon.
                        </BuddySay>
                        <ol className="space-y-4">
                            {tipLines.map((line, index) => (
                                <li
                                    key={index}
                                    className="flex gap-4 rounded-2xl border border-amber-brand/20 bg-[oklch(0.985_0.02_85)] px-5 py-4"
                                >
                                    <span className="font-display text-2xl leading-none text-amber-brand-dark">
                                        {index + 1}
                                    </span>
                                    <p className="text-base leading-relaxed text-ink-soft/90">
                                        {line}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </WalkChapter>
                )}

                {/* 4. Practical facts */}
                <WalkChapter
                    step={factsStep}
                    aside="The practical bit"
                    title="Money, timing, the boring-but-useful stuff"
                    last={!nearbyStep && !galleryStep}
                >
                    <dl className="grid gap-3 sm:grid-cols-2">
                        {[
                            { label: 'Entry', value: feeLabel },
                            openingTime && closingTime
                                ? {
                                      label: 'Hours',
                                      value: `${openingTime} – ${closingTime}`,
                                      icon: true,
                                  }
                                : null,
                            attraction.best_time_to_visit
                                ? {
                                      label: 'Best time',
                                      value: attraction.best_time_to_visit,
                                  }
                                : null,
                            {
                                label: 'Type of place',
                                value: attraction.category_name,
                            },
                        ]
                            .filter(
                                (item): item is { label: string; value: string; icon?: boolean } =>
                                    item !== null
                            )
                            .map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-hairline bg-white px-5 py-4"
                                >
                                    <dt className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft/45">
                                        {item.label}
                                    </dt>
                                    <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
                                        {item.icon && (
                                            <Clock
                                                className="size-3.5 text-teal-brand"
                                                aria-hidden="true"
                                            />
                                        )}
                                        {item.value}
                                    </dd>
                                </div>
                            ))}
                    </dl>
                </WalkChapter>

                {/* 5. Nearby */}
                {nearbyStep !== null && (
                    <WalkChapter
                        step={nearbyStep}
                        aside="While we're here"
                        title="If you've got energy left…"
                        last={!galleryStep}
                    >
                        <BuddySay className="mb-6">
                            These are close enough that I&apos;d string them into the same outing.
                        </BuddySay>
                        <ul className="space-y-3">
                            {nearby.map((place) => (
                                <li key={place.id}>
                                    <Link
                                        href={`/attractions/${place.slug}`}
                                        className="group flex gap-4 rounded-2xl border border-hairline bg-white p-3 outline-none transition hover:-translate-y-0.5 hover:shadow-card focus-visible:ring-2 focus-visible:ring-teal-brand"
                                    >
                                        <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-teal-wash">
                                            {place.primary_image ? (
                                                <Image
                                                    src={place.primary_image}
                                                    alt={
                                                        place.primary_image_alt ?? place.short_name
                                                    }
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
                                            <span className="text-[11px] font-medium uppercase tracking-wider text-teal-brand">
                                                {place.category_name}
                                            </span>
                                            <span className="font-display text-lg text-ink">
                                                {place.short_name}
                                            </span>
                                            {place.km !== null && (
                                                <span className="mt-1 text-xs text-ink-soft/60">
                                                    {formatDistance(place.km)} from here ·{' '}
                                                    {travelSummary(place.km)}
                                                </span>
                                            )}
                                        </span>
                                        <ArrowUpRight
                                            className="size-4 shrink-0 self-center text-ink-soft/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </WalkChapter>
                )}

                {/* 6. Gallery */}
                {galleryStep !== null && (
                    <WalkChapter
                        step={galleryStep}
                        aside="Look around"
                        title="A few frames before you go"
                        last
                    >
                        <ul className="grid grid-cols-2 gap-3">
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
                    </WalkChapter>
                )}

                {/* Closing buddy note */}
                <div className="mt-4 rounded-3xl border border-hairline bg-ink px-6 py-8 text-white sm:px-8">
                    <div className="flex items-start gap-4">
                        <BuddyMark />
                        <div>
                            <p className="font-display text-2xl leading-snug">
                                That&apos;s the walk-through.
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-white/65">
                                Go see it for yourself — and if you get stuck, open the map and
                                follow the pin. I&apos;ll be here when you pick the next place.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <TakeMeThere
                                    destination={origin}
                                    destinationName={attraction.short_name}
                                    className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-5 py-2.5 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-white"
                                />
                                <Link
                                    href="/attractions"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    More in {attraction.city_name}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}
