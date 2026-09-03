import Link from 'next/link'
import { Search, SlidersHorizontal, X } from 'lucide-react'

import { getCategoriesWithAttractionCount } from '@/site/api/getCategoriesWithAttractionCount'
import { getCitiesWithAttractionCount } from '@/site/api/getCitiesWithAttractionCount'
import { getPublishedAttractions } from '@/site/api/getPublishedAttractions'
import { AttractionCard } from '@/site/components/AttractionCard'

export const metadata = {
    title: 'All attractions — TravelBuddy',
    description:
        'Browse every published attraction and filter by destination, category or keyword.',
}

type SearchParams = {
    page?: string
    cityId?: string
    categoryId?: string
    search?: string
}

function toPositiveInt(value: string | undefined) {
    if (!value) return undefined
    const parsed = Number.parseInt(value, 10)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export default async function AttractionsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const page = toPositiveInt(params.page) ?? 1
    const cityId = toPositiveInt(params.cityId)
    const categoryId = toPositiveInt(params.categoryId)
    const search = params.search?.trim() || undefined

    const [result, cities, categories] = await Promise.all([
        getPublishedAttractions({ page, cityId, categoryId, search, pageSize: 12 }),
        getCitiesWithAttractionCount(),
        getCategoriesWithAttractionCount(),
    ])

    const { rows, total, pageCount } = result
    const hasFilters = Boolean(cityId || categoryId || search)
    const selectedCity = cities.find((city) => city.id === cityId)
    const selectedCategory = categories.find((category) => category.id === categoryId)

    function buildHref(overrides: Partial<Record<keyof SearchParams, string | undefined>>) {
        const next = { ...params, page: undefined, ...overrides }
        const query = new URLSearchParams()
        if (next.cityId) query.set('cityId', next.cityId)
        if (next.categoryId) query.set('categoryId', next.categoryId)
        if (next.search) query.set('search', next.search)
        if (next.page && next.page !== '1') query.set('page', next.page)
        const qs = query.toString()
        return qs ? `/attractions?${qs}` : '/attractions'
    }

    const filterLinkClass = (active: boolean) =>
        `flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal-brand ${
            active
                ? 'bg-ink font-semibold text-white'
                : 'text-ink-soft/75 hover:bg-teal-wash hover:text-ink'
        }`

    return (
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
            <header className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-brand">
                    {selectedCity ? 'Destination' : 'Everything published'}
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
                    {selectedCity ? selectedCity.name : 'Explore attractions'}
                </h1>
                <p className="mt-4 text-base text-ink-soft/70">
                    {total === 0
                        ? 'Nothing matches these filters yet.'
                        : `${total} place${total === 1 ? '' : 's'} to discover${
                              selectedCategory ? ` in ${selectedCategory.name}` : ''
                          }.`}
                </p>
            </header>

            {/* Active filter chips */}
            {hasFilters && (
                <div className="mt-7 flex flex-wrap items-center gap-2">
                    {search && (
                        <Link
                            href={buildHref({ search: undefined })}
                            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-medium text-ink outline-none transition hover:border-ink focus-visible:ring-2 focus-visible:ring-teal-brand"
                        >
                            “{search}”
                            <X className="size-3.5" aria-hidden="true" />
                            <span className="sr-only">Remove search filter</span>
                        </Link>
                    )}
                    {selectedCity && (
                        <Link
                            href={buildHref({ cityId: undefined })}
                            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-medium text-ink outline-none transition hover:border-ink focus-visible:ring-2 focus-visible:ring-teal-brand"
                        >
                            {selectedCity.name}
                            <X className="size-3.5" aria-hidden="true" />
                            <span className="sr-only">Remove city filter</span>
                        </Link>
                    )}
                    {selectedCategory && (
                        <Link
                            href={buildHref({ categoryId: undefined })}
                            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs font-medium text-ink outline-none transition hover:border-ink focus-visible:ring-2 focus-visible:ring-teal-brand"
                        >
                            {selectedCategory.name}
                            <X className="size-3.5" aria-hidden="true" />
                            <span className="sr-only">Remove category filter</span>
                        </Link>
                    )}
                    <Link
                        href="/attractions"
                        className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft/60 underline-offset-4 outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-teal-brand"
                    >
                        Clear all
                    </Link>
                </div>
            )}

            <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
                {/* ── Filters ─────────────────────────────────── */}
                <aside aria-labelledby="filters-heading">
                    <details
                        open
                        className="rounded-3xl border border-hairline bg-white lg:sticky lg:top-24 [&_summary::-webkit-details-marker]:hidden"
                    >
                        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-3xl px-6 py-5 lg:cursor-default">
                            <SlidersHorizontal
                                className="size-4 text-teal-brand"
                                aria-hidden="true"
                            />
                            <h2 id="filters-heading" className="text-sm font-semibold text-ink">
                                Filters
                            </h2>
                        </summary>

                        <div className="space-y-7 px-6 pb-6">
                            <form action="/attractions" method="GET" role="search">
                                {cityId && <input type="hidden" name="cityId" value={cityId} />}
                                {categoryId && (
                                    <input type="hidden" name="categoryId" value={categoryId} />
                                )}
                                <label
                                    htmlFor="search"
                                    className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft/50"
                                >
                                    Search
                                </label>
                                <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-hairline bg-cream px-3 focus-within:border-teal-brand">
                                    <Search
                                        className="size-4 shrink-0 text-ink-soft/40"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="search"
                                        type="search"
                                        name="search"
                                        defaultValue={search ?? ''}
                                        placeholder="Name or keyword"
                                        className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-soft/40 focus:outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="mt-2.5 w-full rounded-xl bg-ink py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2"
                                >
                                    Apply
                                </button>
                            </form>

                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft/50">
                                    Destination
                                </h3>
                                <ul className="mt-2.5 max-h-64 space-y-0.5 overflow-y-auto">
                                    <li>
                                        <Link
                                            href={buildHref({ cityId: undefined })}
                                            aria-current={!cityId ? 'true' : undefined}
                                            className={filterLinkClass(!cityId)}
                                        >
                                            All destinations
                                        </Link>
                                    </li>
                                    {cities.map((city) => (
                                        <li key={city.id}>
                                            <Link
                                                href={buildHref({ cityId: String(city.id) })}
                                                aria-current={
                                                    cityId === city.id ? 'true' : undefined
                                                }
                                                className={filterLinkClass(cityId === city.id)}
                                            >
                                                <span className="truncate">{city.name}</span>
                                                <span className="shrink-0 text-xs opacity-60">
                                                    {city.attraction_count}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft/50">
                                    Category
                                </h3>
                                <ul className="mt-2.5 max-h-64 space-y-0.5 overflow-y-auto">
                                    <li>
                                        <Link
                                            href={buildHref({ categoryId: undefined })}
                                            aria-current={!categoryId ? 'true' : undefined}
                                            className={filterLinkClass(!categoryId)}
                                        >
                                            All categories
                                        </Link>
                                    </li>
                                    {categories.map((category) => (
                                        <li key={category.id}>
                                            <Link
                                                href={buildHref({
                                                    categoryId: String(category.id),
                                                })}
                                                aria-current={
                                                    categoryId === category.id ? 'true' : undefined
                                                }
                                                className={filterLinkClass(
                                                    categoryId === category.id
                                                )}
                                            >
                                                <span className="truncate">{category.name}</span>
                                                <span className="shrink-0 text-xs opacity-60">
                                                    {category.attraction_count}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </details>
                </aside>

                {/* ── Results ─────────────────────────────────── */}
                <div className="min-w-0">
                    {rows.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-hairline bg-white px-8 py-20 text-center">
                            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-teal-wash text-teal-brand-dark">
                                <Search className="size-5" aria-hidden="true" />
                            </span>
                            <h2 className="mt-5 font-display text-2xl text-ink">
                                No attractions found
                            </h2>
                            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft/70">
                                {hasFilters
                                    ? 'Try widening your filters — or clear them to see everything.'
                                    : 'Once an attraction is marked Published in the content manager it will appear here.'}
                            </p>
                            {hasFilters && (
                                <Link
                                    href="/attractions"
                                    className="mt-7 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2"
                                >
                                    Clear filters
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {rows.map((attraction, index) => (
                                    <li key={attraction.id}>
                                        <AttractionCard
                                            attraction={attraction}
                                            eager={index < 3}
                                        />
                                    </li>
                                ))}
                            </ul>

                            {pageCount > 1 && (
                                <nav
                                    aria-label="Pagination"
                                    className="mt-14 flex items-center justify-center gap-2"
                                >
                                    <Link
                                        href={buildHref({ page: String(page - 1) })}
                                        aria-disabled={page <= 1}
                                        className={`rounded-full border border-hairline px-4 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-teal-brand ${
                                            page <= 1
                                                ? 'pointer-events-none opacity-40'
                                                : 'hover:border-ink hover:bg-white'
                                        }`}
                                    >
                                        Previous
                                    </Link>

                                    <span className="px-3 text-sm text-ink-soft/70">
                                        Page {page} of {pageCount}
                                    </span>

                                    <Link
                                        href={buildHref({ page: String(page + 1) })}
                                        aria-disabled={page >= pageCount}
                                        className={`rounded-full border border-hairline px-4 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-teal-brand ${
                                            page >= pageCount
                                                ? 'pointer-events-none opacity-40'
                                                : 'hover:border-ink hover:bg-white'
                                        }`}
                                    >
                                        Next
                                    </Link>
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
