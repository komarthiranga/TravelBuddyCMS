import { getSelectedCity } from '@/site/lib/selected-city'
import { getPlacesForJourney } from '@/site/api/getPlacesForJourney'
import { BuddyJourney } from '@/site/components/BuddyJourney'

export const metadata = { title: 'Plan your visit — Travel Buddy' }

export default async function GuidePage() {
    const { city } = await getSelectedCity()
    const places = await getPlacesForJourney(city?.id)
    return <BuddyJourney cities={city ? [city] : []} places={places} />
}
