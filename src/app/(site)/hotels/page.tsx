import { collectionMetadata } from '@/site/seo/metadata'
import { PlacesCollection, type SearchParams } from '@/site/components/PlacesCollection'

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
    return collectionMetadata('/hotels', 'Hotels and Places to Stay | TravelBuddy', 'Explore local hotels and places to stay. Check rooms and rates directly with the property.', await searchParams)
}


export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
    return <PlacesCollection collection="stay" searchParams={searchParams} />
}
