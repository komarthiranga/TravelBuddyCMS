import { pageMetadata } from '@/site/seo/metadata'
import { getSelectedCity } from '@/site/lib/selected-city'
import { getPlacesForJourney } from '@/site/api/getPlacesForJourney'
import { BuddyJourney } from '@/site/components/BuddyJourney'

export const metadata = pageMetadata('/guide', 'Plan Your Visit | TravelBuddy', 'Choose a place, set your starting point and find directions for your visit.')

export default async function GuidePage({searchParams}: {searchParams: Promise<{place?: string}>}) {
    const {place} = await searchParams
    const { city } = await getSelectedCity()
    const places = await getPlacesForJourney(city?.id)
    return <BuddyJourney key={`${city?.id ?? "no-city"}-${place ?? ""}`} initialPlaceSlug={place} cities={city ? [city] : []} places={places} />
}
