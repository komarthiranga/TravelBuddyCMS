import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    ArrowLeft,
    Banknote,
    Bike,
    Bus,
    Car,
    Clock,
    Info,
    MapPin,
    Navigation,
    PersonStanding,
    Sun,
    Train,
    type LucideIcon,
} from 'lucide-react'

import { getPublishedAttractionBySlug } from '@/site/api/getPublishedAttractionBySlug'
import { formatFee } from '@/site/components/AttractionCard'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const data = await getPublishedAttractionBySlug(slug)
    if (!data) return { title: 'Not found — TravelBuddy' }

    return {
        title: `${data.attraction.short_name} — TravelBuddy`,
        description: data.attraction.short_description,
        openGraph: {
            title: data.attraction.short_name,
            description: data.attraction.short_description,
            images: data.images[0] ? [data.images[0].image_url] : undefined,
        },
    }
}

const TRAVEL_MODE_ICONS: Record<string, LucideIcon> = {
    TRAIN: Train,
    BUS: Bus,
    CAR: Car,
    AUTO: Car,
    BIKE: Bike,
    WALK: PersonStanding,
}

function formatTime(value: string | null) {
    if (!value) return null
    const [rawHours, rawMinutes] = value.split(':')
    const hours = Number.parseInt(rawHours, 10)
    if (!Number.isInteger(hours)) return null
    const suffix = hours >= 12 ? 'PM' : 'AM'
    return `${hours % 12 || 12}:${rawMinutes ?? '00'} ${suffix}`
}

function titleCase(value: string) {
    return value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
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
    const hero = images[0] ?? null
    const gallery = images.slice(1)

    const openingTime = formatTime(attraction.opening_time)
    const closingTime = formatTime(attraction.closing_time)
    const isFree = Number.parseFloat(attraction.entry_fee) === 0

    const mapQuery =
        attraction.latitude && attraction.longitude
            ? `${attraction.latitude},${attraction.longitude}`
            : `${attraction.full_name}, ${attraction.address}`
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`

    const facts = [
        { label: 'Entry fee', value: formatFee(attraction.entry_fee, attraction.currency_code) },
        openingTime && closingTime
            ? { label: 'Opening hours', value: `${openingTime} – ${closingTime}` }
            : null,
        attraction.best_time_to_visit
            ? { label: 'Best time to visit', value: attraction.best_time_to_visit }
            : null,
        { label: 'Category', value: attraction.category_name },
        { label: 'Destination', value: attraction.city_name },
    ].filter((fact): fact is { label: string; value: string } => fact !== null)

    return (
        <article>
            {/* ── Hero ───────────────────────────────────────────── */}
            <div className="relative isolate min-h-[24rem] overflow-hidden bg-ink sm:min-h-[32rem]">
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
                    className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25"
                />

                <div className="relative mx-auto flex min-h-[24rem] w-full max-w-6xl flex-col justify-between px-5 py-8 sm:min-h-[32rem] sm:px-8">
                    <Link
                        href="/attractions"
                        className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white outline-none backdrop-blur-md transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        All attractions
                    </Link>

                    <div className="max-w-3xl text-white">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-amber-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink">
                                {attraction.category_name}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider backdrop-blur-md">
                                <MapPin className="size-3" aria-hidden="true" />
                                {attraction.city_name}
                            </span>
                        </div>

                        <h1 className="mt-5 font-display text-4xl leading-[1.08] tracking-tight sm:text-6xl">
                            {attraction.short_name}
                        </h1>

                        {attraction.full_name !== attraction.short_name && (
                            <p className="mt-3 text-lg text-white/60">{attraction.full_name}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Body ───────────────────────────────────────────── */}
            <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
                <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
                    <div className="min-w-0 space-y-14">
                        {/* Highlights */}
                        <ul className="flex flex-wrap gap-3">
                            <li
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                                    isFree
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'bg-teal-wash text-teal-brand-dark'
                                }`}
                            >
                                <Banknote className="size-4" aria-hidden="true" />
                                {formatFee(attraction.entry_fee, attraction.currency_code)}
                            </li>
                            {openingTime && closingTime && (
                                <li className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card">
                                    <Clock className="size-4 text-teal-brand" aria-hidden="true" />
                                    {openingTime} – {closingTime}
                                </li>
                            )}
                            {attraction.best_time_to_visit && (
                                <li className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card">
                                    <Sun className="size-4 text-amber-brand-dark" aria-hidden="true" />
                                    {attraction.best_time_to_visit}
                                </li>
                            )}
                        </ul>

                        {/* About */}
                        <section aria-labelledby="about">
                            <h2
                                id="about"
                                className="font-display text-3xl leading-tight text-ink"
                            >
                                About this place
                            </h2>
                            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                                {attraction.short_description}
                            </p>
                            {attraction.full_description && (
                                <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-soft/80">
                                    {attraction.full_description
                                        .split(/\n{2,}/)
                                        .filter(Boolean)
                                        .map((paragraph, index) => (
                                            <p key={index} className="whitespace-pre-line">
                                                {paragraph}
                                            </p>
                                        ))}
                                </div>
                            )}
                        </section>

                        {/* Tips */}
                        {attraction.instructions && (
                            <section
                                aria-labelledby="tips"
                                className="rounded-3xl border border-amber-brand/25 bg-[oklch(0.98_0.03_85)] p-7"
                            >
                                <h2
                                    id="tips"
                                    className="flex items-center gap-2 font-display text-2xl text-ink"
                                >
                                    <Info className="size-5 text-amber-brand-dark" aria-hidden="true" />
                                    Before you go
                                </h2>
                                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink-soft/85">
                                    {attraction.instructions}
                                </p>
                            </section>
                        )}

                        {/* Getting there */}
                        {attraction.travel_modes.length > 0 && (
                            <section aria-labelledby="getting-there">
                                <h2
                                    id="getting-there"
                                    className="font-display text-3xl leading-tight text-ink"
                                >
                                    Getting there
                                </h2>
                                <ul className="mt-5 flex flex-wrap gap-3">
                                    {attraction.travel_modes.map((mode) => {
                                        const Icon = TRAVEL_MODE_ICONS[mode] ?? Navigation
                                        return (
                                            <li
                                                key={mode}
                                                className="inline-flex items-center gap-2.5 rounded-2xl border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink"
                                            >
                                                <Icon
                                                    className="size-4 text-teal-brand"
                                                    aria-hidden="true"
                                                />
                                                {titleCase(mode)}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </section>
                        )}

                        {/* Gallery */}
                        {gallery.length > 0 && (
                            <section aria-labelledby="gallery">
                                <h2
                                    id="gallery"
                                    className="font-display text-3xl leading-tight text-ink"
                                >
                                    Gallery
                                </h2>
                                <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {gallery.map((image) => (
                                        <li
                                            key={image.id}
                                            className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-teal-wash"
                                        >
                                            <Image
                                                src={image.image_url}
                                                alt={image.alt_text ?? attraction.short_name}
                                                fill
                                                sizes="(max-width: 640px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    {/* ── Sidebar ─────────────────────────────── */}
                    <aside aria-labelledby="details" className="lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-3xl border border-hairline bg-white p-7 shadow-card">
                            <h2 id="details" className="font-display text-xl text-ink">
                                Visitor details
                            </h2>

                            <dl className="mt-6 space-y-5">
                                {facts.map((fact) => (
                                    <div key={fact.label}>
                                        <dt className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft/50">
                                            {fact.label}
                                        </dt>
                                        <dd className="mt-1 text-sm font-medium text-ink">
                                            {fact.value}
                                        </dd>
                                    </div>
                                ))}
                                <div>
                                    <dt className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft/50">
                                        Address
                                    </dt>
                                    <dd className="mt-1 text-sm leading-relaxed text-ink-soft/80">
                                        {attraction.address}
                                    </dd>
                                </div>
                            </dl>

                            <a
                                href={mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-white outline-none transition hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2"
                            >
                                <Navigation className="size-4" aria-hidden="true" />
                                Get directions
                            </a>

                            <Link
                                href={`/attractions?cityId=${attraction.city_id}`}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-hairline py-3 text-sm font-semibold text-ink outline-none transition hover:border-ink focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2"
                            >
                                More in {attraction.city_name}
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </article>
    )
}
