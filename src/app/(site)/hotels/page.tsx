import { PlacesCollection, type SearchParams } from '@/site/components/PlacesCollection'

export const metadata = { title: 'Places to stay - TravelBuddy' }

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
    return <PlacesCollection collection="stay" searchParams={searchParams} />
}
