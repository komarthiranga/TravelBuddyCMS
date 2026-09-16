import { pageMetadata } from '@/site/seo/metadata'
import { getSelectedCity } from '@/site/lib/selected-city'
import { getPlacesForJourney } from '@/site/api/getPlacesForJourney'
import { NewVisitorStart } from '@/site/components/NewVisitorStart'
import { HomeHero } from '@/site/components/HomeHero'

export const revalidate = 60

export const metadata = pageMetadata('/', 'Explore Eluru with a Local Guide | TravelBuddy', 'Discover places to visit, food and stays in Eluru, with practical visiting details and help finding your way.')

export default async function HomePage() {
    const { city: homeCity } = await getSelectedCity()
    const places = await getPlacesForJourney(homeCity?.id)
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

            <NewVisitorStart cityName={cityName} places={places} />

        </>
    )
}
