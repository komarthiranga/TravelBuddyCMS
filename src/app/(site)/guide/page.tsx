import { getSelectedCity } from '@/site/lib/selected-city'
import { getPlacesForJourney } from '@/site/api/getPlacesForJourney'
import { BuddyJourney } from '@/site/components/BuddyJourney'

export const metadata = { title: 'Plan your visit — Travel Buddy' }

export default async function GuidePage({searchParams}: {searchParams: Promise<{place?: string}>}) {
    const {place} = await searchParams
    const { city } = await getSelectedCity()
    const places = await getPlacesForJourney(city?.id)
    return <BuddyJourney key={`${city?.id ?? "no-city"}-${place ?? ""}`} initialPlaceSlug={place} cities={city ? [city] : []} places={places} />
}
