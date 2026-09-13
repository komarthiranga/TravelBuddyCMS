'use client'

import Link from 'next/link'
import { CityPicker } from './CityPicker'
import { SavedPlacesButton } from './SavedPlaces'
import { BuddyLogo } from './BuddyLogo'
import { useChrome } from './locale-provider'
import type { CityWithCount } from '@/site/api/getCitiesWithAttractionCount'

export function SiteHeader({
    cities,
    activeCityName,
}: {
    cities: CityWithCount[]
    activeCityName: string
}) {
    const { t, locale, setLocale } = useChrome()
    return (
        <header className="border-b border-hairline bg-cream text-ink">
            <nav
                aria-label="Main"
                className="mx-auto max-w-6xl px-5 py-3 sm:px-8 md:flex md:items-center md:gap-5"
            >
                <div className="flex items-center justify-between gap-1 md:contents">
                    <Link
                        href="/"
                        className="rounded md:mr-auto focus-visible:outline-2 focus-visible:outline-teal-brand"
                    >
                        <BuddyLogo size="sm" />
                    </Link>
                    <div className="flex flex-wrap items-center justify-end gap-1 md:order-last">
                        <div className="hidden md:block"><SavedPlacesButton /></div>
                        <Link
                            href="/help"
                            className="inline-flex min-h-12 items-center rounded-full border border-ink/15 bg-white px-3 font-semibold md:order-last focus-visible:outline-2 focus-visible:outline-teal-brand"
                        >
                            {t.help}
                        </Link>
                    </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 md:mt-0 md:gap-4">
                    <CityPicker
                        cities={cities}
                        activeCityName={activeCityName}
                    />
                    <div
                        role="group"
                        aria-label="Language / భాష"
                        className="flex rounded-full border border-ink/15 bg-white p-1"
                    >
                        {(['en', 'te'] as const).map((language) => (
                            <button
                                key={language}
                                type="button"
                                lang={language}
                                aria-pressed={locale === language}
                                onClick={() => setLocale(language)}
                                className={`min-h-11 rounded-full px-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-teal-brand ${locale === language ? 'bg-ink text-white' : 'text-ink'}`}
                            >
                                {language === 'en' ? 'English' : 'తెలుగు'}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>
        </header>
    )
}
