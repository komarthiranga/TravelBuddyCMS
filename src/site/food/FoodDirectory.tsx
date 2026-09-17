'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Coffee, MapPin, Search, Utensils, Soup } from 'lucide-react'
import type { PublicAttractionCard } from '@/site/api/getPublishedAttractions'
import { AccessibleDialog } from '@/site/components/AccessibleDialog'
import { LocationNotice } from '@/site/components/LocationNotice'
import { VerificationBadge } from '@/site/components/VerificationBadge'
import { TranslationNotice } from '@/site/components/LocalText'
import { useLocation } from '@/site/components/location-provider'
import { distanceKm } from '@/site/lib/geo'
import { TravelOptions } from '@/site/stay/StayDirectory'
import styles from './food.module.css'

function coordinates(place: PublicAttractionCard) {
    if (place.latitude === null || place.longitude === null) return null
    const lat = Number(place.latitude), lng = Number(place.longitude)
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null
}
export function FoodDirectory({ places, cityName }: { places: PublicAttractionCard[]; cityName: string }) {
    const [category, setCategory] = useState('All food')
    const [query, setQuery] = useState('')
    const [sort, setSort] = useState('name')
    const [selected, setSelected] = useState<PublicAttractionCard | null>(null)
    const location = useLocation()
    const origin = location.startPoint?.coords ?? null
    const originLabel = location.startPoint?.kind === 'user' ? 'your location' : location.startPoint?.label ?? ''
    const categories = ['All food', ...Array.from(new Set(places.map(p => p.category_name))).sort()]
    const distance = (p: PublicAttractionCard) => { const coords = coordinates(p); return origin && coords ? distanceKm(origin, coords) : Infinity }
    const filtered = places.filter(p => (category === 'All food' || p.category_name === category) && `${p.short_name} ${p.address} ${p.category_name}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === 'nearest' && origin ? distance(a) - distance(b) || a.short_name.localeCompare(b.short_name) : a.short_name.localeCompare(b.short_name))
    const selectedCoords = selected && coordinates(selected)
    return <div className={styles.page}><div className={styles.container}>
        <section className={styles.hero}><div><p className={styles.eyebrow}>YOUR LOCAL BUDDY · {cityName.toUpperCase()}</p><h1>Settled in?<br /><em>Let’s find a bite.</em></h1><p>A new city feels a little more familiar after a good meal. Find somewhere to eat, check the details and let’s get you there.</p><a href="#find-food" className={styles.primary}>Find a place to eat<ArrowRight size={18} /></a></div><div className={styles.plate} aria-hidden="true"><Utensils size={50} strokeWidth={1.2} /><span>A LITTLE BREAK.<br />A LOCAL BITE.</span><Coffee size={25} /></div></section>
        <section id="find-food" className={styles.finder}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>02 / EAT & RECHARGE</p><h2>What sounds good?</h2></div><p>Food stops in {cityName}</p></div><TranslationNotice />
            <div className={styles.chips} role="group" aria-label="Food category">{categories.map(c => <button type="button" key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}<span>{c === 'All food' ? places.length : places.filter(p => p.category_name === c).length}</span></button>)}</div>
            <div className={styles.search}><Search size={20} /><label htmlFor="food-search" className="sr-only">Search food places or areas</label><input id="food-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a food place or area" /></div>
            <LocationNotice className="my-5" />
            <div className={styles.results}><p role="status">{filtered.length} {filtered.length === 1 ? 'place' : 'places'} to eat</p><label>Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option value="name">Place name</option><option value="nearest" disabled={!origin}>Nearest first</option></select></label></div>
            {origin && <p className={styles.note}>Distances from {originLabel} are straight-line estimates. Open a place for travel routes.</p>}
            <div className={styles.cards}>{filtered.map((p, index) => <article key={p.id} className={styles.card}><div className={styles.cardTop}><div><span>{p.category_name}</span><p>{p.city_name}</p></div><Soup size={38} strokeWidth={1.2} aria-hidden="true" /><b aria-hidden="true">{String(index + 1).padStart(2, '0')}</b></div><div className={styles.cardBody}><h3>{p.short_name}</h3><p className={styles.address}><MapPin size={16} />{p.address}</p><p className={styles.note}>{Number.isFinite(distance(p)) ? `${distance(p).toFixed(1)} km from ${originLabel} · straight line` : 'Set your location to compare distances'}</p><VerificationBadge verification={p.verification} compact /><div className={styles.price}><strong>Check today’s menu & prices</strong><p>Meal prices and opening hours aren’t confirmed here. Check with the venue before going.</p></div><button type="button" className={styles.cardAction} onClick={() => setSelected(p)} aria-label={`View ${p.short_name} details and directions`}>Explore this food stop<ArrowRight size={17} /></button></div></article>)}</div>
            {!filtered.length && <div className={styles.empty}><Soup size={32} /><h3>{places.length ? 'Let’s try another search.' : 'Your next food stop is on its way.'}</h3><p>{places.length ? 'Try a place name or choose All food.' : 'We’re still adding food places for this city. You can change city in the header.'}</p>{places.length > 0 && <button type="button" onClick={() => { setCategory('All food'); setQuery('') }}>Clear filters</button>}</div>}
        </section>
        <aside className={styles.tip}><Coffee size={28} /><div><h2>A little local advice</h2><p>Ask about portion sizes before ordering. For allergies, vegetarian requirements or group seating, speak directly with the restaurant.</p></div></aside>
        {selected && <AccessibleDialog label={`${selected.short_name} food details`} onClose={() => setSelected(null)}><p className={styles.eyebrow}>{selected.category_name}</p><h2 className="mt-3 font-display text-3xl">{selected.short_name}</h2><p className="my-4 text-sm leading-6 text-ink-soft">{selected.address}</p><VerificationBadge verification={selected.verification} /><p className="my-4 text-sm leading-6">Check the current menu, opening hours and dietary requirements before visiting. Listed map pins may need confirmation.</p>{selectedCoords ? <TravelOptions key={selected.id} stay={{ name: selected.short_name, address: selected.address, latitude: selectedCoords.lat, longitude: selectedCoords.lng }} origin={origin} label={originLabel} /> : <p>Travel routes aren’t available until this place has a map location.</p>}<Link href={`/attractions/${selected.slug}`} className="mt-5 inline-flex min-h-12 items-center gap-2 font-semibold text-teal-brand">Full place details & sources<ArrowRight size={17} /></Link></AccessibleDialog>}
    </div></div>
}
