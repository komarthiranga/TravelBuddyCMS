import Link from 'next/link'
import { ArrowRight, BedDouble, LifeBuoy, Utensils } from 'lucide-react'

import { getCitiesWithAttractionCount } from '@/site/api/getCitiesWithAttractionCount'
import { getPlacesForJourney } from '@/site/api/getPlacesForJourney'
import { getFeaturedAttractions } from '@/site/api/getPublishedAttractions'
import { AttractionCard } from '@/site/components/AttractionCard'
import { BuddyJourney } from '@/site/components/BuddyJourney'
import { BuddySay } from '@/site/components/BuddyVoice'

export const revalidate = 60

export const metadata = {
    title: 'TravelBuddy — your local friend on the road',
    description:
        'A local buddy who greets you in your language, then walks you place by place through your city — explaining everything as a friend would.',
}

const NOT_YET = [
    {
        title: 'Somewhere to eat',
        copy: "Local tiffin and street food, not tourist traps. I'm still writing these down.",
        icon: Utensils,
    },
    {
        title: 'A place to stay',
        copy: "Only places I'd let my own cousin sleep in. None listed yet.",
        icon: BedDouble,
    },
    {
        title: 'If something goes wrong',
        copy: 'Hospital, police, pharmacy. I want this exactly right before I promise it.',
        icon: LifeBuoy,
    },
]

export default async function HomePage() {
    const [attractions, cities, places] = await Promise.all([
        getFeaturedAttractions(24),
        getCitiesWithAttractionCount(),
        getPlacesForJourney(),
    ])

    /* The journey greets you for whichever city you are nearest to, so it needs
       every city's coordinates — but it never shows a list to pick from. */
    const homeCity = cities[0] ?? null

    return (
        <>
            <BuddyJourney cities={cities} places={places} />

            {/* ── Everything he knows, plainly listed ───────────── */}
            <section
                id="places"
                aria-labelledby="places-heading"
                className="border-b border-hairline bg-white py-20"
            >
                <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
                    <BuddySay className="mb-7">
                        Prefer to just browse? Here&apos;s every place I know, no hand-holding.
                    </BuddySay>

                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <h2
                            id="places-heading"
                            className="font-display text-4xl leading-tight text-ink"
                        >
                            {homeCity
                                ? `Everything I know in ${homeCity.name}`
                                : 'Everywhere I can take you'}
                        </h2>
                        {attractions.length > 0 && (
                            <Link
                                href="/attractions"
                                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-teal-brand"
                            >
                                Open the full list
                                <ArrowRight
                                    className="size-4 transition-transform group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Link>
                        )}
                    </div>

                    {attractions.length > 0 ? (
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {attractions.map((attraction, index) => (
                                <AttractionCard
                                    key={attraction.id}
                                    attraction={attraction}
                                    eager={index < 3}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-10 rounded-3xl border border-dashed border-hairline bg-cream px-8 py-14 text-center text-sm text-ink-soft/70">
                            Nothing published yet — publish a place in the CMS and I&apos;ll start
                            showing it here.
                        </p>
                    )}
                </div>
            </section>

            {/* ── What he cannot do yet ─────────────────────────── */}
            <section
                id="soon"
                aria-labelledby="soon-heading"
                className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8"
            >
                <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-brand">
                        Being honest
                    </p>
                    <h2 id="soon-heading" className="mt-3 font-display text-4xl leading-tight text-ink">
                        Things I can&apos;t help with yet
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-ink-soft/75">
                        A real local friend tells you what they don&apos;t know. Right now I only
                        know the places worth seeing — the rest is coming.
                    </p>
                </div>

                <ul className="mt-12 grid gap-4 sm:grid-cols-3">
                    {NOT_YET.map((item) => (
                        <li
                            key={item.title}
                            className="rounded-[1.5rem] border border-dashed border-hairline bg-white/60 p-6"
                        >
                            <span className="flex size-11 items-center justify-center rounded-xl bg-teal-wash text-teal-brand-dark">
                                <item.icon className="size-5" aria-hidden="true" />
                            </span>
                            <h3 className="mt-5 font-display text-xl text-ink">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-soft/70">
                                {item.copy}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    )
}
