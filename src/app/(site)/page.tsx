import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getCitiesWithAttractionCount } from '@/site/api/getCitiesWithAttractionCount'
import { getPlacesForJourney } from '@/site/api/getPlacesForJourney'
import { getFeaturedAttractions } from '@/site/api/getPublishedAttractions'
import { AttractionCard } from '@/site/components/AttractionCard'
import { BuddyJourney } from '@/site/components/BuddyJourney'
import { HomeHero } from '@/site/components/HomeHero'

export const revalidate = 60

export const metadata = {
    title: 'TravelBuddy — your local friend on the road',
    description:
        'A local buddy who greets you in your language, then walks you place by place through your city — explaining everything as a friend would.',
}

export default async function HomePage() {
    const [attractions, cities, places] = await Promise.all([
        getFeaturedAttractions(3),
        getCitiesWithAttractionCount(),
        getPlacesForJourney(),
    ])

    const homeCity = cities[0] ?? null
    const cityName = homeCity?.name ?? 'Eluru'

    return (
        <>
            <HomeHero cityName={cityName} />

            <section
                id="places"
                aria-labelledby="places-heading"
                className="border-b border-hairline bg-white py-12 sm:py-16"
            >
                <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h2
                            id="places-heading"
                            className="font-display text-3xl leading-tight text-ink sm:text-4xl"
                        >
                            Popular in {cityName}
                        </h2>
                        <Link
                            href="/attractions"
                            className="inline-flex min-h-12 items-center gap-1.5 text-base font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-teal-brand"
                        >
                            Explore places
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    </div>

                    {attractions.length > 0 ? (
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {attractions.map((attraction, index) => (
                                <AttractionCard
                                    key={attraction.id}
                                    attraction={attraction}
                                    eager={index < 3}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-8 rounded-3xl border border-dashed border-hairline bg-cream px-8 py-14 text-center text-base text-ink-soft">
                            Nothing published yet — publish a place in the CMS and I will start
                            showing it here.
                        </p>
                    )}
                </div>
            </section>

            <div id="guide">
                <BuddyJourney cities={cities} places={places} />
            </div>
        </>
    )
}
