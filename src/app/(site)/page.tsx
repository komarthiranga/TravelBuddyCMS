import { getSelectedCity } from '@/site/lib/selected-city'
import { getPlacesForJourney } from '@/site/api/getPlacesForJourney'
import { NewVisitorStart } from '@/site/components/NewVisitorStart'
import { HomeHero } from '@/site/components/HomeHero'

export const revalidate = 60

export const metadata = {
    title: 'TravelBuddy — your local friend on the road',
    description:
        'A local buddy who greets you in your language, then walks you place by place through your city — explaining everything as a friend would.',
}

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
