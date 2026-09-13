import Link from 'next/link'
import { Search } from 'lucide-react'

import { getCategoriesWithAttractionCount } from '@/site/api/getCategoriesWithAttractionCount'
import { getPublishedAttractions } from '@/site/api/getPublishedAttractions'
import { AttractionCard } from '@/site/components/AttractionCard'
import { AttractionFilters } from '@/site/components/AttractionFilters'
import { LocationNotice } from '@/site/components/LocationNotice'
import { getSelectedCity } from '@/site/lib/selected-city'
import { LocalText, TranslationNotice } from '@/site/components/LocalText'

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

    const { city: homeCity } = await getSelectedCity()
    const [result, categories] = await Promise.all([
        getPublishedAttractions({ page, cityId: homeCity?.id, categoryId, search, pageSize: 12, free, open }),
        getCategoriesWithAttractionCount(homeCity?.id),
    ])

    const { rows, total, pageCount, page: currentPage } = result

    const hasFilters = Boolean(categoryId || search || free || open)
    const selectedCategory = categories.find((category) => category.id === categoryId)
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
        { href: buildHref({ categoryId: undefined }), label: 'All', active: !categoryId },
        ...liveCategories.map((category) => ({
            href: buildHref({ categoryId: String(category.id) }),
            label: category.name,
            active: categoryId === category.id,
        })),
        { href: buildHref({ free: free ? undefined : '1' }), label: 'Free entry', active: free },
        { href: buildHref({ open: open ? undefined : '1' }), label: 'Open now', active: open },
    ]

    return (
        <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
            <header className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-brand-dark">
                    {homeCity ? `${homeCity.state}, ${homeCity.country}` : 'Published places'}
                </p>
                <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-5xl">
                    <LocalText en={homeCity ? `Explore places in ${homeCity.name}` : 'Explore places'} te={homeCity ? `${homeCity.name}లో ప్రదేశాలు` : 'ప్రదేశాలు చూడండి'} />
                </h1>
                <p className="mt-4 text-lg text-ink-soft">
                    <LocalText en={total === 0 ? 'No places match these filters.' : `${total} places${selectedCategory ? ` in ${selectedCategory.name}` : ''}`} te={total === 0 ? 'ఈ ఫిల్టర్లకు సరిపోయే ప్రదేశాలు లేవు.' : `${total} ప్రదేశాలు`} />
                </p>
            </header>

            <TranslationNotice />


            <AttractionFilters
                key={`${search ?? ""}-${categoryId ?? ""}-${free}-${open}`}
                search={search}
                chips={chips}
                buildSearchHref={buildHref({ search })}
                hiddenFields={{
                    ...(categoryId ? { categoryId: String(categoryId) } : {}),
                    ...(free ? { free: '1' } : {}),
                    ...(open ? { open: '1' } : {}),
                }}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p role="status" className="text-sm text-ink-soft"><LocalText en={`${total} ${total === 1 ? 'place' : 'places'} found${search ? ` for “${search}”` : ''}`} te={`${total} ప్రదేశాలు కనబడ్డాయి`} /></p>
                {hasFilters && <Link href="/attractions" className="inline-flex min-h-11 items-center rounded px-2 text-sm font-semibold text-teal-brand-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand"><LocalText en="Reset search & filters" te="శోధన, ఫిల్టర్లను తొలగించండి" /></Link>}
            </div>
            {open && <p className="mt-2 rounded-xl bg-teal-wash p-3 text-sm text-ink"><LocalText en="Open now uses listed hours in India time. Places without hours are excluded; confirm with the venue before travelling." te="భారత కాలమానం ప్రకారం నమోదైన సమయాలను ఉపయోగిస్తాము. సమయాలు లేని ప్రదేశాలు కనిపించవు; వెళ్లే ముందు నిర్ధారించుకోండి." /></p>}
            <details className="mt-3 border-y border-hairline py-2">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-teal-brand-dark focus-visible:outline-2 focus-visible:outline-teal-brand"><LocalText en="Want to see distances? Set your starting point" te="దూరాలను చూడాలా? ప్రారంభ స్థానాన్ని ఎంచుకోండి" /></summary>
                <LocationNotice className="my-3" />
            </details>
            <div className="mt-6 min-w-0">
                {rows.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-hairline bg-white px-5 py-10 text-center">
                        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-teal-wash text-teal-brand-dark">
                            <Search className="size-5" aria-hidden="true" />
                        </span>
                        <h2 className="mt-5 font-display text-2xl text-ink"><LocalText en="No places found" te="ప్రదేశాలు కనబడలేదు" /></h2>
                        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-ink-soft">
                            <LocalText en={hasFilters ? 'Try a shorter place name or remove a filter. You can also browse every place in this city.' : 'We’re still adding places here. Choose another city above.'} te={hasFilters ? 'మరో పదంతో వెతకండి లేదా ఫిల్టర్లను తొలగించండి.' : 'ఇక్కడ సమాచారం ఇంకా లేదు. పైన మరో నగరాన్ని ఎంచుకోండి.'} />
                        </p>
                        {hasFilters && (
                            <Link
                                href="/attractions"
                                className="mt-7 inline-flex min-h-12 items-center rounded-full bg-ink px-5 text-base font-semibold text-white outline-none hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand"
                            >
                                <LocalText en="Clear filters" te="ఫిల్టర్లను తొలగించండి" />
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {rows.map((attraction, index) => (
                                <li key={attraction.id}>
                                    <AttractionCard attraction={attraction} eager={index === 0} />
                                </li>
                            ))}
                        </ul>

                        {pageCount > 1 && (
                            <nav
                                aria-label="Pagination"
                                className="mt-14 flex items-center justify-center gap-2"
                            >
                                <Link
                                    href={buildHref({ page: String(currentPage - 1) })}
                                    aria-disabled={currentPage <= 1}
                                    tabIndex={currentPage <= 1 ? -1 : undefined}
                                    className={`inline-flex min-h-12 items-center rounded-full border border-hairline px-4 text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
                                        currentPage <= 1
                                            ? 'pointer-events-none opacity-40'
                                            : 'hover:border-ink hover:bg-white'
                                    }`}
                                >
                                    <LocalText en="Previous" te="మునుపటి" />
                                </Link>
                                <span className="px-3 text-base text-ink-soft">
                                    Page {currentPage} of {pageCount}
                                </span>
                                <Link
                                    href={buildHref({ page: String(currentPage + 1) })}
                                    aria-disabled={currentPage >= pageCount}
                                    tabIndex={currentPage >= pageCount ? -1 : undefined}
                                    className={`inline-flex min-h-12 items-center rounded-full border border-hairline px-4 text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
                                        currentPage >= pageCount
                                            ? 'pointer-events-none opacity-40'
                                            : 'hover:border-ink hover:bg-white'
                                    }`}
                                >
                                    <LocalText en="Next" te="తరువాతి" />
                                </Link>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
