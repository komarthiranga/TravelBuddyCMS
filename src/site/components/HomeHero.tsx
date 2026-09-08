'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import {
    BedDouble,
    Bus,
    Landmark,
    LifeBuoy,
    Search,
    Utensils,
} from 'lucide-react'

import { LocationNotice } from '@/site/components/LocationNotice'
import { useLocation } from '@/site/components/location-provider'
import { useChrome } from '@/site/components/locale-provider'
import { fillCity } from '@/site/lib/chrome'
import { BuddyMascot } from '@/site/components/BuddyMascot'

const CATEGORIES = [
    { href: '/attractions', key: 'attractions' as const, icon: Landmark, ready: true },
    { href: '/food', key: 'food' as const, icon: Utensils, ready: false },
    { href: '/hotels', key: 'hotels' as const, icon: BedDouble, ready: false },
    { href: '/transport', key: 'transport' as const, icon: Bus, ready: false },
    { href: '/emergency', key: 'emergency' as const, icon: LifeBuoy, ready: false },
]

export function HomeHero({ cityName }: { cityName: string }) {
    const router = useRouter()
    const { t } = useChrome()
    const { request } = useLocation()

    function onSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = event.currentTarget
        const value = String(new FormData(form).get('q') ?? '').trim()
        router.push(value ? `/attractions?search=${encodeURIComponent(value)}` : '/attractions')
    }

    return (
        <section className="border-b border-hairline bg-cream">
            <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
                <div className="flex items-start gap-4 sm:items-center sm:gap-6">
                    <BuddyMascot
                        pose="wave"
                        title="Your local buddy"
                        className="h-20 w-auto shrink-0 sm:h-28"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-brand-dark">
                            {t.heroEyebrow}
                        </p>
                        <h1 className="mt-1 font-display text-3xl leading-tight text-ink sm:text-5xl">
                            {fillCity(t.heroTitle, cityName)}
                        </h1>
                        <p className="mt-2 text-lg text-ink-soft">{t.heroQuestion}</p>
                    </div>
                </div>

                <LocationNotice className="mt-6" />

                <form
                    onSubmit={onSearch}
                    role="search"
                    className="mt-6 flex min-h-12 items-center gap-2 rounded-full border border-ink/15 bg-white px-4 shadow-card focus-within:border-teal-brand"
                >
                    <Search className="size-5 shrink-0 text-ink-soft" aria-hidden="true" />
                    <label htmlFor="home-search" className="sr-only">
                        {t.searchPlaceholder}
                    </label>
                    <input
                        id="home-search"
                        name="q"
                        type="search"
                        placeholder={t.searchPlaceholder}
                        className="min-h-12 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-soft/70 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-white outline-none hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand"
                    >
                        {t.explore}
                    </button>
                </form>

                <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {CATEGORIES.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className="flex min-h-24 flex-col items-start justify-between rounded-3xl border border-hairline bg-white p-4 text-left outline-none transition hover:-translate-y-0.5 hover:shadow-card focus-visible:ring-2 focus-visible:ring-teal-brand motion-reduce:hover:translate-y-0"
                            >
                                <span className="flex size-10 items-center justify-center rounded-xl bg-amber-brand text-ink">
                                    <item.icon className="size-5" aria-hidden="true" />
                                </span>
                                <span>
                                    <span className="mt-3 block text-base font-semibold text-ink">
                                        {t[item.key]}
                                    </span>
                                    {!item.ready && (
                                        <span className="mt-1 inline-flex rounded-full bg-teal-wash px-2 py-0.5 text-xs font-semibold text-teal-brand-dark">
                                            {t.comingSoon}
                                        </span>
                                    )}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <ul className="mt-5 flex flex-wrap gap-2">
                    <li>
                        <Link
                            href="/attractions"
                            onClick={() => request()}
                            className="inline-flex min-h-12 items-center rounded-full border border-ink/15 bg-white px-4 text-base font-semibold text-ink outline-none hover:bg-cream focus-visible:ring-2 focus-visible:ring-teal-brand"
                        >
                            {t.nearMe}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/attractions?open=1"
                            className="inline-flex min-h-12 items-center rounded-full border border-ink/15 bg-white px-4 text-base font-semibold text-ink outline-none hover:bg-cream focus-visible:ring-2 focus-visible:ring-teal-brand"
                        >
                            {t.openNow}
                        </Link>
                    </li>
                    <li>
                        <span
                            title={t.comingSoon}
                            className="inline-flex min-h-12 items-center rounded-full border border-dashed border-ink/20 px-4 text-base font-semibold text-ink-soft"
                        >
                            {t.familyFriendly}
                            <span className="sr-only"> ({t.comingSoon})</span>
                        </span>
                    </li>
                    <li>
                        <Link
                            href="/attractions?free=1"
                            className="inline-flex min-h-12 items-center rounded-full border border-ink/15 bg-white px-4 text-base font-semibold text-ink outline-none hover:bg-cream focus-visible:ring-2 focus-visible:ring-teal-brand"
                        >
                            {t.freePlaces}
                        </Link>
                    </li>
                </ul>
            </div>
        </section>
    )
}
