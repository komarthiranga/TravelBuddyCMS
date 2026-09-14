import { PlaceImage } from './PlaceImage'
import { SavePlaceButton } from './SavedPlaces'
import { LocalText } from './LocalText'
import Link from 'next/link'
import { ArrowUpRight, MapPin } from 'lucide-react'

import type { PublicAttractionCard } from '@/site/api/getPublishedAttractions'
import { DistanceBadge } from '@/site/components/DistanceBadge'

export function formatFee(fee: string, currency: string) {
    const amount = Number.parseFloat(fee)
    if (!Number.isFinite(amount) || amount < 0) return 'Fee unavailable'
    if (amount === 0) return 'Free entry'
    if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`
    return `${currency} ${amount.toLocaleString()}`
}

export function AttractionCard({
    attraction,
    eager = false,
}: {
    attraction: PublicAttractionCard
    eager?: boolean
}) {
    const isFree = Number.parseFloat(attraction.entry_fee) === 0

    return (
        <article className="group relative flex h-full flex-col bg-white">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-teal-wash">
                <PlaceImage src={attraction.primary_image} alt={attraction.primary_image_alt}
                    name={attraction.short_name} category={attraction.category_name} eager={eager}
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" />

                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink backdrop-blur-md">
                    {attraction.category_name}
                </span>

                <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${
                        isFree
                            ? 'bg-emerald-700 text-white'
                            : 'bg-ink/85 text-white'
                    }`}
                >
                    {isFree ? (
                        <LocalText en="Free entry" te="ఉచిత ప్రవేశం" />
                    ) : (
                        formatFee(
                            attraction.entry_fee,
                            attraction.currency_code,
                        )
                    )}
                </span>
            </div>

            <div className="flex flex-1 flex-col px-1 pt-3 pb-2">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-teal-brand-dark">
                        <MapPin className="size-3.5" aria-hidden="true" />
                        {attraction.city_name}
                    </p>
                    <DistanceBadge
                        latitude={attraction.latitude}
                        longitude={attraction.longitude}
                    />
                </div>

                <h3 className="mt-2 text-lg font-semibold leading-snug text-ink">
                    <Link
                        href={`/attractions/${attraction.slug}`}
                        className="rounded outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:ring-2 focus-visible:after:ring-teal-brand focus-visible:after:ring-offset-2"
                    >
                        {attraction.short_name}
                    </Link>
                </h3>

                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {attraction.short_description}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex min-h-12 items-center gap-1.5 text-base font-semibold text-ink group-hover:text-amber-brand-dark">
                        <LocalText en="View details" te="వివరాలు చూడండి" />
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                    </span>
                    <SavePlaceButton
                        compact
                        place={{
                            id: attraction.id,
                            name: attraction.short_name,
                            slug: attraction.slug,
                            city: attraction.city_name,
                        }}
                    />
                </div>
            </div>
        </article>
    )
}
