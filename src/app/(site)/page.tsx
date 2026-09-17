import { readStaySearch, todayInIndia, type StaySearchParams } from '@/site/stay/search'
import { pageMetadata } from '@/site/seo/metadata'
import { getSelectedCity } from '@/site/lib/selected-city'
import { getStays } from '@/site/stay/data'
import { StayHome } from '@/site/stay/StayHome'

export const metadata = pageMetadata('/', 'Feel at Home in a New City | TravelBuddy', 'Your local buddy for a new city. Find a stay, discover food, plan travel and explore everyday essentials, places and help.')

export default async function HomePage({ searchParams }: { searchParams: Promise<StaySearchParams> }) {
    const today = todayInIndia()
    const search = readStaySearch(await searchParams, today)
    const { city } = await getSelectedCity()
    const stays = await getStays(city?.id)
    return <StayHome stays={stays} cityName={city?.name ?? 'your city'} today={today} search={search} />
}
