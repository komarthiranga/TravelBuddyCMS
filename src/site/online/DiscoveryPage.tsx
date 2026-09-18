'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BedDouble, Coffee, Compass, LocateFixed, MapPin, ShieldCheck, ShoppingBag, Sparkles, TrainFront, Heart, Navigation } from 'lucide-react'
import { useOnline } from './OnlineProvider'
import { categories, searchTypes, typeLabel, type Category, type OnlinePlace } from './model'
import { discovery } from './client'
import { PlaceCard } from './PlaceCard'
import styles from './discovery.module.css'

const presentation = {
    attractions: { icon: Compass, label: 'Explore', image: 'explore', heading: 'A little wonder.', ending: 'Just around the corner.', line: 'Slow walks, unexpected discoveries, and places that make a day.' },
    hotels: { icon: BedDouble, label: 'Stay', image: 'stay', heading: 'Check in.', ending: 'Feel right at home.', line: 'Find your kind of stay, from a quick stop to a longer escape.' },
    food: { icon: Coffee, label: 'Eat & drink', image: 'food-cafe', heading: 'Follow your appetite.', ending: 'Find a new favourite.', line: 'Local kitchens, coffee breaks, and something delicious nearby.' },
    transport: { icon: TrainFront, label: 'Get around', image: 'explore', heading: 'Less getting lost.', ending: 'More going places.', line: 'Find stations and local transport for the next part of your day.' },
    essentials: { icon: ShoppingBag, label: 'Everyday', image: 'nature', heading: 'Little essentials.', ending: 'A smoother day.', line: 'The everyday stops that help a new place feel familiar.' },
    services: { icon: ShieldCheck, label: 'Local help', image: 'nature', heading: 'A helping hand.', ending: 'Close when you need it.', line: 'Find hospitals, pharmacies and useful services in your area.' },
}
export function DiscoveryPage({ category = 'attractions', home = false }: { category?: Category; home?: boolean }) {
    const { city, position, locating, locationError, requestLocation, setPickerOpen } = useOnline()
    const config = categories.find(c => c.id === category)!
    const look = presentation[category]
    const [type, setType] = useState<string>(config.type)
    const [results, setResults] = useState<{ key: string; places: OnlinePlace[]; error?: string } | null>(null)
    const [retry, setRetry] = useState(0)
    const [filter, setFilter] = useState('all')
    const cityId = city?.id
    const latitude = position?.latitude, longitude = position?.longitude
    const hasDestination = !!cityId || !!position
    const key = `${cityId}:${latitude}:${longitude}:${category}:${type}:${retry}`
    const loading = hasDestination && results?.key !== key
    const error = results?.key === key ? results.error : ''
    useEffect(() => {
        if (!cityId && latitude === undefined) return
        const controller = new AbortController()
        discovery<{ places: OnlinePlace[] }>({ action: 'search', cityId, ...(latitude !== undefined ? { position: { latitude, longitude } } : {}), category, type }, controller.signal)
            .then(data => { if (!controller.signal.aborted) setResults({ key, places: data.places }) })
            .catch(cause => { if (!controller.signal.aborted) setResults({ key, places: [], error: cause.message }) })
        return () => controller.abort()
    }, [cityId, latitude, longitude, category, type, key, retry])
    const places = results?.key === key ? results.places : []
    const foundTypes = [...new Set(places.map(p => p.type))]
    const activeFilter = foundTypes.includes(filter) ? filter : 'all'
    return <div className={styles.page}>
        <section className={`${styles.hero} ${!home || hasDestination ? styles.compactHero : ''}`}>
            <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>Small plans. Lovely discoveries.</span>
                <h1>{home ? <>Go somewhere.<br/><em>Feel like you belong.</em></> : <>{look.heading}<br/><em>{look.ending}</em></>}</h1>
                <p>{home ? 'Your favourite corner of a new city is waiting. Find good food, cosy stays, and a little adventure along the way.' : look.line}</p>
                <div className={styles.heroButtons}><button className={styles.primary} disabled={locating} onClick={requestLocation}><LocateFixed size={16}/>{locating ? 'Finding your location…' : 'Explore near me'}<ArrowUpRight size={15}/></button><button className={styles.secondary} onClick={() => setPickerOpen(true)}>Choose a city<ArrowRight size={15}/></button></div>
                <span className={styles.locationHint}><ShieldCheck size={12}/>With permission. Shared with Google Maps, never saved.</span>
            </div>
            <figure className={styles.postcard}>
                <Image src={`/images/categories/${look.image}.webp`} alt="" width={600} height={400} priority={home} />
                <div className={styles.stamp}><Compass size={27}/><span>Made for</span><strong>the curious</strong></div>
                <span className={styles.postcardNote}>A little detour. A lovely memory.</span>
                <figcaption className={styles.postcardCaption}><span>THE ART OF WANDERING</span><Heart size={14}/></figcaption>
            </figure>
        </section>
        {locationError && <p role="alert" className={styles.notice}>{locationError}</p>}
        <section className={styles.locationStrip} aria-label="Discovery location"><span><MapPin size={17}/></span><div><strong>{locating ? 'Finding your starting point…' : position ? 'Your neighbourhood, a little closer.' : city ? `A day out in ${city.name}` : 'Your next discovery starts with a place.'}</strong><p>{position ? 'Nearby places around your current location · India' : city ? city.address : 'Explore where you are, or choose somewhere new.'}</p></div><button onClick={() => setPickerOpen(true)}>{hasDestination ? 'Change' : 'Choose city'}</button></section>
        <nav className={styles.categoryNav} aria-label="Discover by category">{categories.map(c => { const item = presentation[c.id], Icon = item.icon; return <Link key={c.id} href={`/${c.id}`} aria-current={c.id === category ? 'page' : undefined}><Icon/><span>{item.label}</span></Link> })}</nav>
        {!hasDestination ? <section className={styles.empty}><div><span className={styles.eyebrow}>Something for your kind of day</span><h2 className="mt-3">The best plans start nearby.</h2><p>Pick a city or share your location. We’ll bring you real places to eat, stay and explore, one good discovery at a time.</p><div className={styles.heroButtons}><button onClick={requestLocation} disabled={locating} className={styles.primary}><LocateFixed size={15}/>{locating ? 'Locating…' : 'Use my location'}</button><button onClick={() => setPickerOpen(true)} className={styles.secondary}>Browse a city</button></div></div><div className={styles.emptyIcon}><Compass size={45} strokeWidth={1}/></div></section> : <>
            <div className={styles.sectionTop}><div><span className={styles.eyebrow}>{position ? 'Closer than you think' : 'Your city, your pace'}</span><h2>{position ? 'Good places around you' : `A little more of ${city?.name}`}</h2><p>{look.label} · Within 15 km of {position ? 'your location' : 'the city centre'} · Up to 10 discoveries</p></div><label className={styles.select}>I’m looking for<select value={type} onChange={event => { setType(event.target.value); setFilter('all') }}>{searchTypes[category].map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}</select></label></div>
            <div role="status" aria-live="polite">{loading && <p className="mb-4 text-xs text-ink-soft">Finding a few places for you…</p>}{error && <div className={styles.notice}><p>{error}</p><button onClick={() => setRetry(n => n + 1)} className="mt-2 min-h-11 font-semibold underline">Try again</button></div>}</div>
            {loading && <div className={styles.grid} aria-hidden="true">{[0,1,2].map(n => <div key={n} className={styles.skeleton}/>)}</div>}
            {!loading && !error && results?.key === key && <>
                {foundTypes.length > 1 && <div className={styles.chips} aria-label="Categories in these results">{['all', ...foundTypes].map(t => <button key={t} aria-pressed={activeFilter === t} onClick={() => setFilter(t)}>{t === 'all' ? 'All discoveries' : typeLabel(t)}</button>)}</div>}
                {!places.length && <section className={styles.empty}><div><h2>A little further afield?</h2><p>No places came back for this category. Try another type of place or explore a different city.</p><button className={`${styles.secondary} mt-4`} onClick={() => setPickerOpen(true)}>Explore another city<Navigation size={15}/></button></div><Sparkles size={35}/></section>}
                <div className={styles.grid}>{places.filter(p => activeFilter === 'all' || p.type === activeFilter).map(place => <PlaceCard key={place.id} place={place}/>)}</div>
            </>}
        </>}
        <div className={styles.bottomNote}><Compass size={21}/><span>Good places. Your own pace.<br/>Place information by Google Maps. Details can change.</span><Link href="/saved">Keep your favourites ↗</Link></div>
    </div>
}
