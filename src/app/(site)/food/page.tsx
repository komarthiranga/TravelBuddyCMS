import { PlacesCollection, type SearchParams } from '@/site/components/PlacesCollection'

export const metadata = { title: 'Places to eat - TravelBuddy' }

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
    return <PlacesCollection collection="food" searchParams={searchParams} />
}
