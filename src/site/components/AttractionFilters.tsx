'use client'

import Link from 'next/link'
import { useChrome } from './locale-provider'
import { Search } from 'lucide-react'

export type FilterChip = {
    href: string
    label: string
    active: boolean
}

export function AttractionFilters({
    search,
    chips,
    hiddenFields,
}: {
    search?: string
    chips: FilterChip[]
    buildSearchHref: string
    hiddenFields?: Record<string, string>
}) {
    const { locale } = useChrome()
    const te = locale === 'te'
    return (
        <div lang={locale} className="mt-5">
            <form
                action="/attractions"
                method="GET"
                role="search"
                className="flex min-h-12 items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 focus-within:ring-2 focus-within:ring-teal-brand"
            >
                {hiddenFields &&
                    Object.entries(hiddenFields).map(([name, value]) => (
                        <input key={name} type="hidden" name={name} value={value} />
                    ))}
                <Search className="size-5 shrink-0 text-ink-soft" aria-hidden="true" />
                <label htmlFor="attractions-search" className="sr-only">
                    {te ? 'ప్రదేశాలను వెతకండి' : 'Search places'}
                </label>
                <input
                    id="attractions-search"
                    type="search"
                    name="search"
                    defaultValue={search ?? ''}
                    placeholder={te ? 'ప్రదేశాలను వెతకండి' : 'Search places'}
                    className="min-h-12 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-soft/70 focus:outline-none"
                />
                <button
                    type="submit"
                    className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-white outline-none hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand"
                >
                    {te ? 'వెతకండి' : 'Search'}
                </button>
            </form>

            <p className="mt-4 text-sm font-semibold text-ink-soft">{te ? 'ప్రదేశం రకం' : 'Type of place'}</p>
            <div className="mt-2 flex flex-wrap gap-2">
                {chips.filter(chip => chip.label !== 'Free entry' && chip.label !== 'Open now').map((chip) => (
                    <Chip key={chip.href + chip.label} chip={chip} />
                ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={te ? 'మరిన్ని ఫిల్టర్లు' : 'Additional filters'}>
                {chips.filter(chip => chip.label === 'Free entry' || chip.label === 'Open now').map(chip => <Chip key={chip.label} chip={chip} />)}
            </div>

        </div>
    )
}

function Chip({ chip }: { chip: FilterChip }) {
    const { locale } = useChrome()
    const labels: Record<string, string> = { All: 'అన్నీ', 'Free entry': 'ఉచిత ప్రవేశం', 'Open now': 'ఇప్పుడు తెరిచి ఉన్నవి' }
    return (
        <Link
            href={chip.href}
            aria-current={chip.active ? 'true' : undefined}
            className={`inline-flex min-h-12 items-center rounded-xl px-4 text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
                chip.active
                    ? 'bg-ink text-white'
                    : 'border border-ink/15 bg-white text-ink hover:bg-cream'
            }`}
        >
            {locale === 'te' ? labels[chip.label] ?? chip.label : chip.label}
        </Link>
    )
}
