'use client'

import { AccessibleDialog } from './AccessibleDialog'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, MapPin, Search } from 'lucide-react'

type Credit = { name: string; url: string | null; avatar?: string | null }
type Place = { id: string; name: string; address: string; image: string | null; mapsUrl: string | null; photoSourceUrl: string | null; authors: Credit[]; attributions: Credit[] }

export function OnlinePlacesPreview({ cityName = 'Eluru' }: { cityName?: string }) {
    const [selectedPhoto, setSelectedPhoto] = useState<Place | null>(null)
    const [loadedCategory, setLoadedCategory] = useState('')
    const [places, setPlaces] = useState<Place[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    async function discover(category: string) {
        if (loading) return
        setLoading(true); setError(''); setPlaces([]); setLoadedCategory('')
        try {
            const response = await fetch('/api/online-places', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category }), cache: 'no-store', signal: AbortSignal.timeout(25000) })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error ?? 'Unable to load places.')
            setPlaces(data.places); setLoadedCategory(category)
        } catch (failure) { setError(failure instanceof Error && failure.name !== 'TimeoutError' ? failure.message : 'The search took too long. Please try again.') }
        finally { setLoading(false) }
    }
    return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Find your kind of day in {cityName}</h2>
        <p className="mt-2 text-base text-ink-soft">Somewhere to explore, a bite to eat, or a place to stay.</p>
        <div role="group" aria-label="Discover places" className="mt-5 flex flex-wrap gap-2">{(['attractions', 'restaurants', 'hotels'] as const).map(item => <button key={item} type="button" disabled={loading} aria-pressed={loadedCategory === item} onClick={() => void discover(item)} className={`inline-flex min-h-12 items-center gap-2 rounded-xl border px-5 font-semibold capitalize focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand disabled:opacity-60 ${loadedCategory === item ? 'buddy-selected' : 'border-hairline bg-white text-ink hover:bg-teal-wash'}`}><Search className="size-4" aria-hidden="true"/>{item}</button>)}</div>
        <div role="status" aria-live="polite" className="mt-5 text-sm text-ink-soft">{loading ? 'Loading places and available photos…' : loadedCategory ? `${places.length} ${loadedCategory} returned by Google Maps` : 'Choose what you’d like to discover.'}</div>
        {error && <p role="alert" className="mt-4 rounded-xl border border-hairline bg-cream p-4">{error}</p>}
        {loadedCategory && places.length === 0 && <p className="mt-4">No results this time. Try another category or <Link href="/attractions" className="underline">browse Buddy’s guide</Link>.</p>}
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{places.map(place => <article key={place.id} className="min-w-0">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-teal-wash">{place.image ? <button type="button" onClick={() => setSelectedPhoto(place)} aria-label={`Enlarge photo of ${place.name} and view credits`} className="block h-full w-full cursor-zoom-in focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-teal-brand">
                {/* Provider photos are displayed directly; Next Image would add a persistent optimization cache. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={place.image} alt={place.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.setAttribute('aria-label', 'Photo unavailable') }} /></button> : <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-ink-soft"><MapPin className="size-7" aria-hidden="true"/>Photo unavailable</div>}</div>
            <h3 className="mt-3 text-lg font-semibold text-ink">{place.name}</h3><p className="mt-1 text-sm leading-relaxed text-ink-soft">{place.address}</p>
            {place.mapsUrl && <a href={place.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-teal-brand-dark underline">View on Google Maps<ArrowUpRight className="size-4" aria-hidden="true"/><span className="sr-only"> (new tab)</span></a>}
            {place.attributions.map((credit,index) => <p key={index} className="text-xs text-ink-soft">{credit.url ? <a href={credit.url} className="underline" target="_blank" rel="noopener noreferrer">{credit.name}</a> : credit.name}</p>)}
        </article>)}</div>
        <p translate="no" className="mt-6 border-t border-hairline pt-4 text-sm font-normal text-[#5E5E5E]">Google Maps</p>
        {selectedPhoto && <AccessibleDialog label={`Photo of ${selectedPhoto.name}`} onClose={() => setSelectedPhoto(null)}>
            <h2 className="mb-4 text-xl font-semibold">{selectedPhoto.name}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedPhoto.image!} alt={selectedPhoto.name} referrerPolicy="no-referrer" className="max-h-[55vh] w-full rounded-xl object-contain" />
            <div className="mt-4 space-y-3">{selectedPhoto.authors.map((author,index) => <div key={index} className="flex items-center gap-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {author.avatar && <img src={author.avatar} alt="" referrerPolicy="no-referrer" className="size-9 rounded-full" />}
                <span>Photo: {author.url ? <a href={author.url} target="_blank" rel="noopener noreferrer" className="underline">{author.name}</a> : author.name}</span>
            </div>)}</div>
            {selectedPhoto.photoSourceUrl && <a href={selectedPhoto.photoSourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm underline">View original photo on Google Maps</a>}
            <p translate="no" className="mt-4 text-sm font-normal text-[#5E5E5E]">Google Maps</p>
        </AccessibleDialog>}
    </div>
}
