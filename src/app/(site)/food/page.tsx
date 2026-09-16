import { collectionMetadata } from '@/site/seo/metadata'
import { PlacesCollection, type SearchParams } from '@/site/components/PlacesCollection'

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
    return collectionMetadata('/food', 'Restaurants and Cafes | TravelBuddy', 'Find restaurants and food stops, with photos and visiting details.', await searchParams)
}


export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
    return <PlacesCollection collection="food" searchParams={searchParams} />
}
