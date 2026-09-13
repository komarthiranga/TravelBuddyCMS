'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, MapPin, Search, ArrowUpRight } from 'lucide-react'
import { AccessibleDialog } from './AccessibleDialog'
import { useChrome } from './locale-provider'
import { useLocation } from './location-provider'
import type { CityWithCount } from '@/site/api/getCitiesWithAttractionCount'

function persistCity(id: number) {
    document.cookie = `tb-city=${id}; Path=/; Max-Age=2592000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
}

export function CityPicker({
    cities,
    activeCityName,
}: {
    cities: CityWithCount[]
    activeCityName: string
}) {
    const { locale } = useChrome()
    const te = locale === 'te'
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [pending, startTransition] = useTransition()
    const router = useRouter()
    const { clear } = useLocation()
    const visible = cities.filter((city) =>
        `${city.name} ${city.state} ${city.country}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
    )
    function choose(id: number) {
        const city = cities.find((item) => item.id === id)
        if (!city) return
        setOpen(false)
        if (city.name === activeCityName) return
        persistCity(id)
        clear()
        startTransition(() => {
            router.push('/')
            router.refresh()
        })
    }
    return (
        <>
            <button
                type="button"
                lang={locale}
                aria-haspopup="dialog"
                aria-expanded={open}
                disabled={pending}
                onClick={() => {
                    setQuery('')
                    setOpen(true)
                }}
                className="group inline-flex min-h-12 max-w-full items-center gap-2 rounded-2xl border border-teal-brand/20 bg-teal-wash px-3 py-2 text-left text-ink transition-colors hover:border-teal-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand disabled:opacity-60"
            >
                <span className="hidden size-8 shrink-0 sm:flex items-center justify-center rounded-full bg-white text-teal-brand-dark">
                    <MapPin className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                    <span className="block text-xs text-teal-brand-dark">
                        {pending
                            ? te
                                ? 'మారుస్తున్నాను…'
                                : 'Switching city…'
                            : te
                              ? 'చూస్తున్న నగరం'
                              : 'Exploring'}
                    </span>
                    <span
                        lang="en"
                        className="block max-w-36 truncate text-sm font-semibold"
                    >
                        {activeCityName}
                    </span>
                </span>
                <ChevronDown
                    aria-hidden="true"
                    className="ml-1 size-4 shrink-0 text-teal-brand-dark"
                />
            </button>
            {open && (
                <AccessibleDialog
                    label={te ? 'నగరాన్ని ఎంచుకోండి' : 'Choose your city'}
                    onClose={() => setOpen(false)}
                >
                    <div lang={locale}>
                        <p className="text-sm font-semibold text-teal-brand-dark">
                            {te
                                ? 'కొత్త నగరం, కొత్త అనుభవం'
                                : 'A new city. A new little adventure.'}
                        </p>
                        <h2 className="mt-2 font-display text-3xl leading-tight">
                            {te
                                ? 'ఎక్కడికి వెళ్దాం?'
                                : 'Where shall we explore?'}
                        </h2>
                        <p className="mt-3 text-base leading-relaxed text-ink-soft">
                            {te
                                ? 'ప్రదేశాల సమాచారం అందుబాటులో ఉన్న నగరాలను ఎంచుకోండి.'
                                : 'Find a city and see what Buddy can help you discover.'}
                        </p>
                        <label className="mt-5 flex items-center gap-3 rounded-xl border border-ink/20 bg-white px-4 focus-within:ring-2 focus-within:ring-teal-brand">
                            <Search
                                className="size-5 shrink-0 text-ink-soft"
                                aria-hidden="true"
                            />
                            <span className="sr-only">
                                {te
                                    ? 'నగరం లేదా రాష్ట్రం వెతకండి'
                                    : 'Search city or state'}
                            </span>
                            <input
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder={
                                    te
                                        ? 'నగరం లేదా రాష్ట్రం…'
                                        : 'Search city or state…'
                                }
                                className="min-h-12 min-w-0 w-full bg-transparent text-base outline-none"
                            />
                        </label>
                        <p role="status" className="mt-4 text-sm text-ink-soft">
                            {te
                                ? `${visible.length} నగరాలు`
                                : `${visible.length} ${visible.length === 1 ? 'city' : 'cities'} available`}
                        </p>
                        <ul className="mt-3 space-y-2">
                            {visible.map((city) => (
                                <li key={city.id}>
                                    <button
                                        type="button"
                                        onClick={() => choose(city.id)}
                                        aria-current={
                                            city.name === activeCityName
                                                ? 'true'
                                                : undefined
                                        }
                                        className={`flex min-h-20 w-full items-center gap-3 rounded-2xl border p-4 text-left focus-visible:outline-2 focus-visible:outline-teal-brand ${city.name === activeCityName ? 'border-teal-brand bg-teal-wash' : 'border-hairline bg-white hover:border-teal-brand/50'}`}
                                    >
                                        <MapPin
                                            className="size-5 shrink-0 text-teal-brand-dark"
                                            aria-hidden="true"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span
                                                lang="en"
                                                className="block text-lg font-semibold"
                                            >
                                                {city.name}
                                            </span>
                                            <span
                                                lang="en"
                                                className="block text-sm text-ink-soft"
                                            >
                                                {city.state}, {city.country}
                                            </span>
                                            <span className="mt-1 block text-sm text-teal-brand-dark">
                                                {city.attraction_count > 0
                                                    ? te
                                                        ? `${city.attraction_count} ప్రదేశాలు చూడండి`
                                                        : `${city.attraction_count} ${city.attraction_count === 1 ? 'place' : 'places'} to explore`
                                                    : te
                                                      ? 'ప్రదేశాల సమాచారం త్వరలో'
                                                      : 'Places are being added'}
                                            </span>
                                        </span>
                                        {city.name === activeCityName ? (
                                            <Check
                                                className="size-5 shrink-0 text-teal-brand-dark"
                                                aria-label={
                                                    te
                                                        ? 'ఎంచుకున్న నగరం'
                                                        : 'Selected city'
                                                }
                                            />
                                        ) : (
                                            <ArrowUpRight
                                                className="size-5 shrink-0"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {visible.length === 0 && (
                            <div className="mt-4 rounded-2xl border border-dashed border-hairline p-5">
                                <p className="text-base">
                                    {te
                                        ? 'ఆ నగరం ఇంకా అందుబాటులో లేదు. మరో నగరాన్ని వెతకండి.'
                                        : 'Buddy hasn’t reached that city yet. Try another city or state.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="mt-3 min-h-11 font-semibold text-teal-brand-dark underline"
                                >
                                    {te
                                        ? 'అన్ని నగరాలు చూడండి'
                                        : 'See all available cities'}
                                </button>
                            </div>
                        )}
                    </div>
                </AccessibleDialog>
            )}
        </>
    )
}
