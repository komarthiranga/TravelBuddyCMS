'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export type FilterChip = {
    href: string
    label: string
    active: boolean
}

export function AttractionFilters({
    search,
    chips,
    buildSearchHref,
    hiddenFields,
}: {
    search?: string
    chips: FilterChip[]
    buildSearchHref: string
    hiddenFields?: Record<string, string>
}) {
    const [open, setOpen] = useState(false)

    return (
        <div className="mt-8">
            <form
                action="/attractions"
                method="GET"
                role="search"
                className="flex min-h-12 items-center gap-2 rounded-full border border-ink/15 bg-white px-4"
            >
                {hiddenFields &&
                    Object.entries(hiddenFields).map(([name, value]) => (
                        <input key={name} type="hidden" name={name} value={value} />
                    ))}
                <Search className="size-5 shrink-0 text-ink-soft" aria-hidden="true" />
                <label htmlFor="attractions-search" className="sr-only">
                    Search places
                </label>
                <input
                    id="attractions-search"
                    type="search"
                    name="search"
                    defaultValue={search ?? ''}
                    placeholder="Search places"
                    className="min-h-12 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-soft/70 focus:outline-none"
                />
                <button
                    type="submit"
                    className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-white outline-none hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand"
                >
                    Search
                </button>
            </form>

            <div className="mt-4 hidden flex-wrap gap-2 md:flex">
                {chips.map((chip) => (
                    <Chip key={chip.href + chip.label} chip={chip} />
                ))}
            </div>

            <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full border border-ink/15 bg-white px-5 text-base font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-teal-brand md:hidden"
            >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
            </button>

            {open && (
                <div className="fixed inset-0 z-[80] md:hidden">
                    <button
                        type="button"
                        aria-label="Close filters"
                        className="absolute inset-0 bg-ink/50"
                        onClick={() => setOpen(false)}
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Filters"
                        className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-cream px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4"
                    >
                        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-ink/20" />
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-2xl">Filters</h2>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="inline-flex size-12 items-center justify-center rounded-full bg-white outline-none focus-visible:ring-2 focus-visible:ring-teal-brand"
                            >
                                <X className="size-5" aria-hidden="true" />
                                <span className="sr-only">Close</span>
                            </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {chips.map((chip) => (
                                <Chip key={chip.href + chip.label} chip={chip} />
                            ))}
                        </div>
                        <Link
                            href={buildSearchHref}
                            className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-ink text-base font-semibold text-white"
                            onClick={() => setOpen(false)}
                        >
                            Show places
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

function Chip({ chip }: { chip: FilterChip }) {
    return (
        <Link
            href={chip.href}
            aria-current={chip.active ? 'true' : undefined}
            className={`inline-flex min-h-12 items-center rounded-full px-4 text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
                chip.active
                    ? 'bg-ink text-white'
                    : 'border border-ink/15 bg-white text-ink hover:bg-cream'
            }`}
        >
            {chip.label}
        </Link>
    )
}
