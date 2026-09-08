import Link from 'next/link'
import { Search } from 'lucide-react'

import { getCategoriesWithAttractionCount } from '@/site/api/getCategoriesWithAttractionCount'
import { getCitiesWithAttractionCount } from '@/site/api/getCitiesWithAttractionCount'
import { getPublishedAttractions } from '@/site/api/getPublishedAttractions'
import { AttractionCard } from '@/site/components/AttractionCard'
import { AttractionFilters } from '@/site/components/AttractionFilters'
import { LocationNotice } from '@/site/components/LocationNotice'
import { isOpenNow } from '@/site/lib/geo'

export const metadata = {
    title: 'Explore places — TravelBuddy',
    description: 'Browse every published place, filtered by the kind of trip you are after.',
}

type SearchParams = {
    page?: string
    categoryId?: string
    search?: string
    free?: string
    open?: string
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
    const categoryId = toPositiveInt(params.categoryId)
    const search = params.search?.trim() || undefined
    const free = params.free === '1'
    const open = params.open === '1'

    const [result, cities, categories] = await Promise.all([
        getPublishedAttractions({ page, categoryId, search, pageSize: 12, free }),
        getCitiesWithAttractionCount(),
        getCategoriesWithAttractionCount(),
    ])

    let { rows, total, pageCount } = result
    if (open) {
        rows = rows.filter((row) => isOpenNow(row.opening_time, row.closing_time))
        total = rows.length
        pageCount = 1
    }

    const hasFilters = Boolean(categoryId || search || free || open)
    const selectedCategory = categories.find((category) => category.id === categoryId)
    const homeCity = cities.length === 1 ? cities[0] : null
    const liveCategories = categories.filter((category) => category.attraction_count > 0)

    function buildHref(overrides: Partial<Record<keyof SearchParams, string | undefined>>) {
        const next = { ...params, page: undefined, ...overrides }
        const query = new URLSearchParams()
        if (next.categoryId) query.set('categoryId', next.categoryId)
        if (next.search) query.set('search', next.search)
        if (next.free) query.set('free', next.free)
        if (next.open) query.set('open', next.open)
        if (next.page && next.page !== '1') query.set('page', next.page)
        const qs = query.toString()
        return qs ? `/attractions?${qs}` : '/attractions'
    }

    const chips = [
        { href: buildHref({ categoryId: undefined, free: undefined, open: undefined }), label: 'All', active: !categoryId && !free && !open },
        ...liveCategories.map((category) => ({
            href: buildHref({ categoryId: String(category.id), free: undefined, open: undefined }),
            label: category.name,
            active: categoryId === category.id && !free && !open,
        })),
        { href: buildHref({ free: '1', categoryId: undefined, open: undefined }), label: 'Free entry', active: free },
        { href: buildHref({ open: '1', categoryId: undefined, free: undefined }), label: 'Open now', active: open },
    ]

    return (
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
            <header className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-brand-dark">
                    {homeCity ? `${homeCity.state}, ${homeCity.country}` : 'Published places'}
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
                    {homeCity ? `Explore places in ${homeCity.name}` : 'Explore places'}
                </h1>
                <p className="mt-4 text-lg text-ink-soft">
                    {total === 0
                        ? 'Nothing matches these filters yet.'
                        : `${total} place${total === 1 ? '' : 's'}${
                              selectedCategory ? ` in ${selectedCategory.name}` : ''
                          }.`}
                </p>
            </header>

            <LocationNotice className="mt-6" />

            <AttractionFilters
                search={search}
                chips={chips}
                buildSearchHref={buildHref({ search })}
                hiddenFields={{
                    ...(categoryId ? { categoryId: String(categoryId) } : {}),
                    ...(free ? { free: '1' } : {}),
                    ...(open ? { open: '1' } : {}),
                }}
            />

            <div className="mt-10 min-w-0">
                {rows.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-hairline bg-white px-8 py-20 text-center">
                        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-teal-wash text-teal-brand-dark">
                            <Search className="size-5" aria-hidden="true" />
                        </span>
                        <h2 className="mt-5 font-display text-2xl text-ink">Nothing here yet</h2>
                        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-ink-soft">
                            {hasFilters
                                ? 'Try widening your filters — or clear them to see everything.'
                                : 'Once a place is marked Published in the content manager it will appear here.'}
                        </p>
                        {hasFilters && (
                            <Link
                                href="/attractions"
                                className="mt-7 inline-flex min-h-12 items-center rounded-full bg-ink px-5 text-base font-semibold text-white outline-none hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand"
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
                                    <AttractionCard attraction={attraction} eager={index < 3} />
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
                                    className={`inline-flex min-h-12 items-center rounded-full border border-hairline px-4 text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
                                        page <= 1
                                            ? 'pointer-events-none opacity-40'
                                            : 'hover:border-ink hover:bg-white'
                                    }`}
                                >
                                    Previous
                                </Link>
                                <span className="px-3 text-base text-ink-soft">
                                    Page {page} of {pageCount}
                                </span>
                                <Link
                                    href={buildHref({ page: String(page + 1) })}
                                    aria-disabled={page >= pageCount}
                                    className={`inline-flex min-h-12 items-center rounded-full border border-hairline px-4 text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
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
    )
}
