'use client'

import Link from 'next/link'
import { ChevronDown, LifeBuoy } from 'lucide-react'

import { BuddyLogo } from '@/site/components/BuddyLogo'
import { useChrome } from '@/site/components/locale-provider'
import type { CityWithCount } from '@/site/api/getCitiesWithAttractionCount'

export function SiteHeader({
    cities,
    activeCityName,
}: {
    cities: CityWithCount[]
    activeCityName: string
}) {
    const { t, locale, setLocale } = useChrome()
    const city = cities.find((item) => item.name === activeCityName) ?? cities[0]

    return (
        <header className="sticky top-0 z-50 border-b border-hairline/70 bg-cream/90 backdrop-blur-xl">
            <nav
                aria-label="Main"
                className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 py-2 sm:px-8"
            >
                <Link
                    href="/"
                    className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                >
                    <BuddyLogo size="sm" />
                </Link>

                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    {city && (
                        <label className="relative hidden min-h-12 items-center md:inline-flex">
                            <span className="sr-only">{t.cityMenu}</span>
                            <select
                                defaultValue={city.id}
                                className="h-12 max-w-[10rem] appearance-none rounded-full border border-ink/15 bg-white py-2 pl-4 pr-10 text-base font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-teal-brand"
                                aria-label={t.cityMenu}
                            >
                                {cities.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="pointer-events-none absolute right-3 size-4 text-ink-soft"
                                aria-hidden="true"
                            />
                        </label>
                    )}

                    <div
                        className="hidden items-center rounded-full border border-ink/15 bg-white p-1 md:inline-flex"
                        role="group"
                        aria-label="Language"
                    >
                        <button
                            type="button"
                            onClick={() => setLocale('en')}
                            aria-pressed={locale === 'en'}
                            className={`min-h-10 rounded-full px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
                                locale === 'en' ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
                            }`}
                        >
                            {t.langEnglish}
                        </button>
                        <button
                            type="button"
                            onClick={() => setLocale('te')}
                            aria-pressed={locale === 'te'}
                            className={`min-h-10 rounded-full px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
                                locale === 'te' ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
                            }`}
                        >
                            {t.langTelugu}
                        </button>
                    </div>

                    <Link
                        href="/help"
                        className="hidden min-h-12 items-center gap-2 rounded-full px-4 text-base font-semibold text-ink outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-teal-brand md:inline-flex"
                    >
                        <LifeBuoy className="size-4" aria-hidden="true" />
                        {t.help}
                    </Link>

                    <Link
                        href="/#guide"
                        className="inline-flex min-h-12 items-center rounded-full bg-ink px-5 text-base font-semibold text-white outline-none hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                    >
                        {t.guideMe}
                    </Link>
                </div>
            </nav>
        </header>
    )
}
