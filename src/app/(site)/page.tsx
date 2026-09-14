import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getSelectedCity } from '@/site/lib/selected-city'
import { LocalText } from '@/site/components/LocalText'
import { getPlacesForJourney } from '@/site/api/getPlacesForJourney'
import { getFeaturedAttractions } from '@/site/api/getPublishedAttractions'
import { AttractionCard } from '@/site/components/AttractionCard'
import { HomeHero } from '@/site/components/HomeHero'

export const revalidate = 60

export const metadata = {
    title: 'TravelBuddy — your local friend on the road',
    description:
        'A local buddy who greets you in your language, then walks you place by place through your city — explaining everything as a friend would.',
}

export default async function HomePage() {
    const { city: homeCity } = await getSelectedCity()
    const [attractions, places] = await Promise.all([
        getFeaturedAttractions(3, homeCity?.id),
        getPlacesForJourney(homeCity?.id),
    ])
    const cityName = homeCity?.name ?? 'Eluru'

    return (
        <>
            <HomeHero
                cityName={cityName}
                places={places
                    .map(
                        ({
                            id,
                            short_name,
                            slug,
                            category_name,
                            category_id,
                            short_description,
                            primary_image,
                            primary_image_alt,
                        }) => ({
                            id,
                            short_name,
                            slug,
                            category_name,
                            category_id,
                            short_description,
                            primary_image,
                            primary_image_alt,
                        }),
                    )}
            />

            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
                <p className="text-base text-ink-soft"><LocalText en="Found a place? Let’s work out how to get there." te="ప్రదేశాన్ని ఎంచుకున్నారా? అక్కడికి వెళ్లే దారిని చూద్దాం." /></p>
                <Link href="/guide" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold text-teal-brand-dark underline underline-offset-4"><LocalText en="Plan your visit" te="సందర్శనను ప్లాన్ చేయండి" /><ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>

            <section
                id="places"
                aria-labelledby="places-heading"
                className="border-b border-hairline bg-cream py-8 sm:py-12"
            >
                <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h2
                            id="places-heading"
                            className="font-display text-3xl leading-tight text-ink sm:text-4xl"
                        >
                            <LocalText
                                en={`Places to discover in ${cityName}`}
                                te={`${cityName}లో చూడదగిన ప్రదేశాలు`}
                            />
                        </h2>
                        <Link
                            href="/attractions"
                            className="inline-flex min-h-12 items-center gap-1.5 text-base font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-teal-brand"
                        >
                            <LocalText en="All places" te="అన్ని ప్రదేశాలు" />
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    </div>

                    {attractions.length > 0 ? (
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {attractions.map((attraction) => (
                                <AttractionCard
                                    key={attraction.id}
                                    attraction={attraction}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-8 rounded-3xl border border-dashed border-hairline bg-cream px-8 py-14 text-center text-base text-ink-soft">
                            <LocalText
                                en="We’re still adding places here. Try another city."
                                te="ఇక్కడ ప్రదేశాల సమాచారం త్వరలో అందుబాటులోకి వస్తుంది. మరో నగరాన్ని ఎంచుకోండి."
                            />
                        </p>
                    )}
                </div>
            </section>


        </>
    )
}
