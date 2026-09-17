import { collectionMetadata } from '@/site/seo/metadata'
import type { SearchParams } from '@/site/components/PlacesCollection'
import { getPublishedAttractions } from '@/site/api/getPublishedAttractions'
import { getSelectedCity } from '@/site/lib/selected-city'
import { FoodDirectory } from '@/site/food/FoodDirectory'

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
    return collectionMetadata('/food', 'Restaurants and Cafes | TravelBuddy', 'Find restaurants and food stops, with photos and visiting details.', await searchParams)
}


export default async function Page() {
    const { city } = await getSelectedCity()
    const first = city ? await getPublishedAttractions({ cityId: city.id, collection: 'food', pageSize: 100 }) : null
    const remaining = first && first.pageCount > 1 ? await Promise.all(Array.from({ length: first.pageCount - 1 }, (_, index) => getPublishedAttractions({ cityId: city!.id, collection: 'food', pageSize: 100, page: index + 2 }))) : []
    return <FoodDirectory places={[...(first?.rows ?? []), ...remaining.flatMap(page => page.rows)]} cityName={city?.name ?? 'your city'} />
}
