import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, MapPin } from 'lucide-react'

import type { PublicAttractionCard } from '@/site/api/getPublishedAttractions'

export function formatFee(fee: string, currency: string) {
    const amount = Number.parseFloat(fee)
    if (!Number.isFinite(amount) || amount === 0) return 'Free entry'
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
        <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-hairline bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover focus-within:-translate-y-1 focus-within:shadow-card-hover">
            <div className="relative aspect-[4/3] overflow-hidden bg-teal-wash">
                {attraction.primary_image ? (
                    <Image
                        src={attraction.primary_image}
                        alt={attraction.primary_image_alt ?? attraction.short_name}
                        fill
                        preload={eager}
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                ) : (
                    <div
                        aria-hidden="true"
                        className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--teal-wash),oklch(0.96_0.03_75))]"
                    >
                        <MapPin className="size-9 text-teal-brand/35" />
                    </div>
                )}

                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink backdrop-blur-md">
                    {attraction.category_name}
                </span>

                <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-md ${
                        isFree
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-ink/80 text-white'
                    }`}
                >
                    {formatFee(attraction.entry_fee, attraction.currency_code)}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-teal-brand">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {attraction.city_name}
                </p>

                <h3 className="mt-2 font-display text-xl leading-snug text-ink">
                    <Link
                        href={`/attractions/${attraction.slug}`}
                        className="rounded outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:ring-2 focus-visible:after:ring-teal-brand focus-visible:after:ring-offset-2"
                    >
                        {attraction.short_name}
                    </Link>
                </h3>

                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-soft/75">
                    {attraction.short_description}
                </p>

                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-amber-brand-dark">
                    Explore
                    <ArrowUpRight
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                    />
                </span>
            </div>
        </article>
    )
}
