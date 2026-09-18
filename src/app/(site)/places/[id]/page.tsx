import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PlaceDetails } from '@/site/online/PlaceDetails'
import { validPlaceId } from '@/site/online/model'

export const metadata = { title: 'Place details | TravelBuddy', robots: { index: false } }
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!validPlaceId(id)) notFound()
    return <div className="mx-auto max-w-3xl px-5 py-8"><h1 className="sr-only">Place details</h1><Link href="/attractions" className="mb-5 inline-flex min-h-11 items-center text-sm font-semibold text-teal-brand-dark">← Explore places</Link><PlaceDetails id={id} /></div>
}
