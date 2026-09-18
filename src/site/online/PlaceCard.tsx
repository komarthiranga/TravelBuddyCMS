'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, Heart, MapPin, ImageIcon, ArrowUpRight, Compass, Coffee, BedDouble, Navigation, ShoppingBag, ShieldCheck } from 'lucide-react'
import styles from './discovery.module.css'
import { useOnline } from './OnlineProvider'
import { discovery } from './client'
import { typeLabel, type OnlinePlace } from './model'

export function PlaceActions({ id }: { id: string }) {
    const { places, update, userError, loaded } = useOnline()
    const current = places.find(p => p.place_id === id)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    async function toggle(field: 'saved' | 'liked') {
        setBusy(true); setError('')
        try { await update(id, field, !current?.[field]) }
        catch (cause) { setError(cause instanceof Error ? cause.message : 'Please retry.') }
        finally { setBusy(false) }
    }
    return <div><div className={styles.actions}>
        <button disabled={busy || !loaded || !!userError} aria-pressed={!!current?.saved} onClick={() => void toggle('saved')} ><Bookmark size={16} fill={current?.saved ? 'currentColor' : 'none'} />{current?.saved ? 'Saved' : 'Save'}</button>
        <button disabled={busy || !loaded || !!userError} aria-pressed={!!current?.liked} onClick={() => void toggle('liked')} ><Heart size={16} fill={current?.liked ? 'currentColor' : 'none'} />{current?.liked ? 'Liked' : 'Like'}</button>
    </div>{(error || userError) && <p role="alert" className="mt-2 text-sm text-amber-900">{error || userError}</p>}</div>
}
export function PlaceCard({ place, detailed = false }: { place: OnlinePlace; detailed?: boolean }) {
    const [image, setImage] = useState<string | null>(null)
    const [photoError, setPhotoError] = useState('')
    const [loading, setLoading] = useState(false)
    async function photo() {
        if (!place.photo) return
        setLoading(true); setPhotoError('')
        try { const data = await discovery<{ url: string }>({ action: 'photo', name: place.photo.name }); setImage(data.url) }
        catch (cause) { setPhotoError(cause instanceof Error ? cause.message : 'Photo unavailable.') }
        finally { setLoading(false) }
    }
    const prices: Record<string, string> = { PRICE_LEVEL_FREE: 'Free price level', PRICE_LEVEL_INEXPENSIVE: 'Budget friendly', PRICE_LEVEL_MODERATE: 'Moderate price level', PRICE_LEVEL_EXPENSIVE: 'Expensive', PRICE_LEVEL_VERY_EXPENSIVE: 'Very expensive' }
    const Icon = /restaurant|cafe|bakery|food/.test(place.type) ? Coffee : /hotel|lodging|hostel/.test(place.type) ? BedDouble : /hospital|pharmacy|police/.test(place.type) ? ShieldCheck : /store|market|shopping/.test(place.type) ? ShoppingBag : Compass
    return <article className={styles.resultCard}>
        {!detailed && <div className={styles.cardBanner}><Icon/><span>A little discovery</span></div>}
        {image && <figure><Image unoptimized src={image} width={800} height={500} alt={place.name} className={styles.detailPhoto} onError={() => { setImage(null); setPhotoError('This photo could not load. Please retry.') }} /><figcaption className="px-5 pt-2 text-xs text-ink-soft">{place.photo?.authors.map((a, i) => <span key={i}>{i > 0 && ' · '}{a.url ? <a href={a.url} target="_blank" rel="noreferrer" className="underline">{a.name}</a> : a.name}</span>)}</figcaption></figure>}
        <div className={styles.cardBody}>
            <p className={styles.cardType}>{typeLabel(place.type)}</p>
            <h2 >{detailed ? place.name : <Link href={`/places/${encodeURIComponent(place.id)}`} prefetch={false} className="hover:underline">{place.name}</Link>}</h2>
            <p className={styles.cardAddress}><MapPin size={16} className="mt-1 shrink-0" />{place.address}</p>
            {place.distanceKm !== undefined && <p className={styles.cardDistance}><Navigation size={12}/>{place.distanceKm < 1 ? `${Math.round(place.distanceKm * 1000)} m` : `${place.distanceKm.toFixed(1)} km`} from your starting point · straight line</p>}
            {detailed && <div className={styles.detailInfo}>
                {place.rating !== undefined && <p>★ {place.rating} / 5 · {place.reviews ?? 0} Google reviews</p>}
                {place.businessStatus && place.businessStatus !== 'OPERATIONAL' && <p className="font-semibold text-amber-900">{typeLabel(place.businessStatus.toLowerCase())}</p>}
                {place.open !== undefined && <p>{place.open ? 'Listed as open now' : 'Listed as closed now'}</p>}
                {place.hours?.length ? <details><summary className="cursor-pointer font-semibold">Opening hours</summary><ul className="mt-2">{place.hours.map(day => <li key={day}>{day}</li>)}</ul></details> : <p>Opening hours unavailable. Check with the place before travelling.</p>}
                {place.priceLevel && prices[place.priceLevel] && <p>{prices[place.priceLevel]} · not a live room or menu quote</p>}
                {place.phone && <p>Phone: <a className="underline" href={`tel:${place.phone.replace(/[^+\d]/g, '')}`}>{place.phone}</a></p>}
                {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer" className="block underline">Visit website ↗</a>}
            </div>}
            {detailed && place.photo && !image && <button disabled={loading} onClick={() => void photo()} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-wash px-4 text-sm font-semibold disabled:opacity-50"><ImageIcon size={18} />{loading ? 'Loading photo…' : 'Show photo'}</button>}
            {photoError && <p role="alert" className="mt-2 text-sm text-amber-900">{photoError}</p>}
            <div className="mt-auto">
                <div className={styles.cardFooter}>
                    {!detailed ? <Link href={`/places/${encodeURIComponent(place.id)}`} prefetch={false}>Take a look<ArrowUpRight size={16}/></Link> : place.mapsUrl ? <a href={place.mapsUrl} target="_blank" rel="noopener noreferrer">Google Maps<ArrowUpRight size={16}/></a> : <span/>}
                    <PlaceActions id={place.id}/>
                </div>
            </div>
            <p className={styles.source}>Google Maps{place.attributions.map((a, i) => <span key={i}> · {a.url ? <a href={a.url} target="_blank" rel="noreferrer" className="underline">{a.name}</a> : a.name}</span>)}</p>
        </div>
    </article>
}
