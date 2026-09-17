import { readStaySearch, todayInIndia, type StaySearchParams } from '@/site/stay/search'
import { pageMetadata } from '@/site/seo/metadata'
import { getSelectedCity } from '@/site/lib/selected-city'
import { getStays } from '@/site/stay/data'
import { StayDirectory } from '@/site/stay/StayDirectory'

export const metadata = pageMetadata('/hotels', 'Find a Stay | TravelBuddy', 'Find hotels, OYO rooms, hostels and individual rooms. Your local buddy helps you compare stays and get there.')
export default async function Page({ searchParams }: { searchParams: Promise<StaySearchParams> }) {
 const today = todayInIndia()
 const search = readStaySearch(await searchParams, today)
 const { city } = await getSelectedCity()
 const stays = await getStays(city?.id)
 return <StayDirectory stays={stays} cityName={city?.name ?? 'your city'} today={today} search={search} />
}
