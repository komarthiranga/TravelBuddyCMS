import { PlacesCollection, type SearchParams } from '@/site/components/PlacesCollection'

export const metadata = { title: 'Explore places - TravelBuddy' }
export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
    return <PlacesCollection searchParams={searchParams} />
}
