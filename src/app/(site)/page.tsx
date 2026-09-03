import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, MapPin, Search, Sparkles } from 'lucide-react'

import { getCategoriesWithAttractionCount } from '@/site/api/getCategoriesWithAttractionCount'
import { getCitiesWithAttractionCount } from '@/site/api/getCitiesWithAttractionCount'
import { getFeaturedAttractions } from '@/site/api/getPublishedAttractions'
import { AttractionCard } from '@/site/components/AttractionCard'
import { categoryIcon } from '@/site/components/category-icon'

// Content is CMS-driven, so serve a cached render and refresh it in the background.
export const revalidate = 60

export const metadata = {
    title: 'TravelBuddy — Places worth the detour',
    description:
        'A carefully kept guide to temples, waterfalls, parks and viewpoints, with the timings, fees and directions you need before you go.',
}

export default async function HomePage() {
    const [featured, cities, categories] = await Promise.all([
        getFeaturedAttractions(6),
        getCitiesWithAttractionCount(),
        getCategoriesWithAttractionCount(),
    ])

    const publishedCount = cities.reduce((sum, city) => sum + city.attraction_count, 0)
    const heroImages = featured.filter((item) => item.primary_image).slice(0, 3)

    return (
        <>
            {/* ── Hero ───────────────────────────────────────────── */}
            <section className="relative isolate overflow-hidden bg-ink text-white">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-40 -top-52 size-[46rem] rounded-full opacity-70 blur-[2px]"
                    style={{
                        background:
                            'radial-gradient(circle, oklch(0.74 0.155 58 / 0.22), transparent 62%)',
                    }}
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-64 -left-40 size-[38rem] rounded-full"
                    style={{
                        background:
                            'radial-gradient(circle, oklch(0.52 0.088 195 / 0.34), transparent 65%)',
                    }}
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 grain" />

                <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-28 pt-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-36 lg:pt-28">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/75 backdrop-blur-sm">
                            <Sparkles className="size-3.5 text-amber-brand" aria-hidden="true" />
                            Curated, not crowdsourced
                        </p>

                        <h1 className="mt-7 font-display text-[2.75rem] leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]">
                            Places worth
                            <br />
                            <span className="text-gradient-warm">the detour.</span>
                        </h1>

                        <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
                            Temples, waterfalls, parks and quiet viewpoints — each one written up with
                            the timings, entry fees and directions you actually need before you go.
                        </p>

                        <form
                            action="/attractions"
                            method="GET"
                            role="search"
                            className="mt-9 flex w-full max-w-md items-center gap-2 rounded-full border border-white/15 bg-white/8 p-2 backdrop-blur-md focus-within:border-white/35"
                        >
                            <label htmlFor="hero-search" className="sr-only">
                                Search attractions
                            </label>
                            <Search
                                className="ml-3 size-4 shrink-0 text-white/45"
                                aria-hidden="true"
                            />
                            <input
                                id="hero-search"
                                type="search"
                                name="search"
                                placeholder="Search a place or city…"
                                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="shrink-0 rounded-full bg-amber-brand px-5 py-2.5 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                            >
                                Search
                            </button>
                        </form>

                        <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
                            {[
                                { label: 'Published places', value: publishedCount },
                                { label: 'Destinations', value: cities.length },
                                { label: 'Categories', value: categories.length },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <dt className="order-2 text-xs uppercase tracking-widest text-white/45">
                                        {stat.label}
                                    </dt>
                                    <dd className="font-display text-3xl text-white">
                                        {stat.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Image composition — only when there is imagery to show */}
                    {heroImages.length > 0 && (
                        <div aria-hidden="true" className="relative hidden lg:block">
                            <div className="relative ml-auto aspect-[4/5] w-[86%] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                                <Image
                                    src={heroImages[0].primary_image!}
                                    alt=""
                                    fill
                                    preload
                                    sizes="(max-width: 1024px) 0px, 420px"
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                                <div className="absolute bottom-5 left-5 right-5">
                                    <p className="text-[11px] uppercase tracking-widest text-white/60">
                                        {heroImages[0].city_name}
                                    </p>
                                    <p className="font-display text-2xl text-white">
                                        {heroImages[0].short_name}
                                    </p>
                                </div>
                            </div>

                            {heroImages[1] && (
                                <div className="absolute -left-2 bottom-10 aspect-square w-40 overflow-hidden rounded-3xl border-4 border-ink shadow-2xl">
                                    <Image
                                        src={heroImages[1].primary_image!}
                                        alt=""
                                        fill
                                        sizes="160px"
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div aria-hidden="true" className="absolute inset-x-0 bottom-0">
                    <svg
                        viewBox="0 0 1440 72"
                        preserveAspectRatio="none"
                        className="h-12 w-full sm:h-16"
                        fill="var(--cream)"
                    >
                        <path d="M0 72V26c180 24 360 36 540 36s360-12 540-36c120-16 240-22 360-18v64H0Z" />
                    </svg>
                </div>
            </section>

            {/* ── Categories ─────────────────────────────────────── */}
            <section
                id="categories"
                aria-labelledby="categories-heading"
                className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8"
            >
                <div className="max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-brand">
                        Browse
                    </p>
                    <h2
                        id="categories-heading"
                        className="mt-3 font-display text-4xl leading-tight text-ink"
                    >
                        What kind of trip are you in the mood for?
                    </h2>
                </div>

                <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {categories.map((category) => {
                        const Icon = categoryIcon(category.code)
                        return (
                            <li key={category.id}>
                                <Link
                                    href={`/attractions?categoryId=${category.id}`}
                                    className="group flex h-full items-center gap-3.5 rounded-2xl border border-hairline bg-white p-4 outline-none transition duration-200 hover:-translate-y-0.5 hover:border-teal-brand/40 hover:shadow-card focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2"
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-wash text-teal-brand-dark transition-colors group-hover:bg-teal-brand group-hover:text-white">
                                        <Icon className="size-5" aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-ink">
                                            {category.name}
                                        </span>
                                        <span className="block text-xs text-ink-soft/55">
                                            {category.attraction_count > 0
                                                ? `${category.attraction_count} place${category.attraction_count === 1 ? '' : 's'}`
                                                : 'Coming soon'}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </section>

            {/* ── Featured ───────────────────────────────────────── */}
            <section
                aria-labelledby="featured-heading"
                className="border-y border-hairline bg-white py-20"
            >
                <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <div className="max-w-xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-brand">
                                Recently published
                            </p>
                            <h2
                                id="featured-heading"
                                className="mt-3 font-display text-4xl leading-tight text-ink"
                            >
                                The latest additions
                            </h2>
                        </div>

                        {featured.length > 0 && (
                            <Link
                                href="/attractions"
                                className="group inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2"
                            >
                                View all
                                <ArrowRight
                                    className="size-4 transition-transform group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Link>
                        )}
                    </div>

                    {featured.length > 0 ? (
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featured.map((attraction, index) => (
                                <AttractionCard
                                    key={attraction.id}
                                    attraction={attraction}
                                    eager={index < 3}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 rounded-3xl border border-dashed border-hairline bg-cream px-8 py-16 text-center">
                            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-teal-wash text-teal-brand-dark">
                                <MapPin className="size-5" aria-hidden="true" />
                            </span>
                            <h3 className="mt-5 font-display text-2xl text-ink">
                                Nothing published just yet
                            </h3>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft/70">
                                Attractions appear here once their status is set to{' '}
                                <span className="font-semibold text-ink">Published</span> in the
                                content manager.
                            </p>
                            <Link
                                href="/attraction"
                                className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2"
                            >
                                Open content manager
                                <ArrowUpRight className="size-4" aria-hidden="true" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Destinations ───────────────────────────────────── */}
            <section
                id="destinations"
                aria-labelledby="destinations-heading"
                className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8"
            >
                <div className="max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-brand">
                        Destinations
                    </p>
                    <h2
                        id="destinations-heading"
                        className="mt-3 font-display text-4xl leading-tight text-ink"
                    >
                        Start with a city
                    </h2>
                </div>

                {cities.length > 0 ? (
                    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {cities.map((city) => (
                            <li key={city.id}>
                                <Link
                                    href={`/attractions?cityId=${city.id}`}
                                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-hairline bg-white p-6 outline-none transition duration-300 hover:-translate-y-1 hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute -right-10 -top-10 size-32 rounded-full bg-teal-wash transition-transform duration-500 group-hover:scale-150"
                                    />
                                    <span className="relative">
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-ink text-white">
                                            <MapPin className="size-4" aria-hidden="true" />
                                        </span>
                                        <span className="mt-5 block font-display text-2xl text-ink">
                                            {city.name}
                                        </span>
                                        <span className="mt-1 block text-sm text-ink-soft/60">
                                            {city.state}, {city.country}
                                        </span>
                                    </span>
                                    <span className="relative mt-8 flex items-center justify-between border-t border-hairline pt-4 text-sm">
                                        <span className="text-ink-soft/70">
                                            {city.attraction_count > 0
                                                ? `${city.attraction_count} place${city.attraction_count === 1 ? '' : 's'}`
                                                : 'Coming soon'}
                                        </span>
                                        <ArrowUpRight
                                            className="size-4 text-ink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-10 rounded-3xl border border-dashed border-hairline bg-white px-8 py-14 text-center text-sm text-ink-soft/70">
                        No active cities yet — add one in the content manager and it will show up
                        here.
                    </p>
                )}
            </section>
        </>
    )
}
