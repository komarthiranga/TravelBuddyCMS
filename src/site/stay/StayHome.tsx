'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, BedDouble, Building2, Check, CheckCheck, GraduationCap, House, KeyRound, LocateFixed, MapPin, Phone, Search, Sun, Utensils, Bus, Compass } from 'lucide-react'
import { AccessibleDialog } from '@/site/components/AccessibleDialog'
import { BuddyMascot } from '@/site/components/BuddyMascot'
import { useLocation } from '@/site/components/location-provider'
import { useChrome } from '@/site/components/locale-provider'
import { TranslationNotice } from '@/site/components/LocalText'
import { distanceKm } from '@/site/lib/geo'
import { TravelOptions } from './StayDirectory'
import type { Stay } from './data'
import { StaySearchForm, StayPriceStatus } from './StaySearchForm'
import { searchSummary, staySearchQuery, type StaySearch } from './search'
import styles from './stay-home.module.css'
import { BuddyNavigation } from '@/site/components/BuddyNavigation'

const kinds = [
    { id: 'hotel', label: 'Hotels', te: 'హోటళ్లు', icon: Building2 },
    { id: 'oyo', label: 'OYO rooms', te: 'OYO గదులు', icon: BedDouble },
    { id: 'hostel', label: 'Hostels & PGs', te: 'హాస్టళ్లు & PGలు', icon: GraduationCap },
    { id: 'room', label: 'Individual rooms', te: 'వ్యక్తిగత గదులు', icon: House },
] as const

export function StayHome({ stays, cityName, today, search }: { stays: Stay[]; cityName: string; today: string; search: StaySearch }) {
    const { locale } = useChrome()
    const te = locale === 'te'
    const [kind, setKind] = useState<Stay['kind']>('hotel')
    const [query, setQuery] = useState('')
    const [sort, setSort] = useState('name')
    const [selected, setSelected] = useState<Stay | null>(null)
    const location = useLocation()
    const origin = location.startPoint?.coords ?? null
    const originLabel = location.startPoint?.kind === 'user' ? 'your location' : location.startPoint?.label ?? ''
    const filtered = stays.filter(stay => stay.kind === kind && `${stay.name} ${stay.area} ${stay.address}`.toLowerCase().includes(query.trim().toLowerCase()))
    filtered.sort((a, b) => origin && sort === 'nearest'
        ? distanceKm(origin, { lat: a.latitude, lng: a.longitude }) - distanceKm(origin, { lat: b.latitude, lng: b.longitude })
        : a.name.localeCompare(b.name))

    function findStay(event: FormEvent) {
        event.preventDefault()
        document.getElementById('find-your-stay')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }

    const locationControls = <div className={styles.locationControls}>
        <button type="button" onClick={location.request} disabled={location.status === 'locating'}><LocateFixed size={17} />{location.status === 'locating' ? 'Finding you…' : origin ? 'Refresh location' : 'Use my location'}</button>
        {location.cityCentre && <button type="button" onClick={location.chooseCentre} className={styles.subtleButton}>Use city centre</button>}
    </div>
    const locationMessage = location.status === 'denied' ? 'Location access is blocked. Enable it in your browser, or use the city centre.'
        : location.status === 'error' || location.status === 'unavailable' ? 'Location couldn’t be found. Try again, or use the city centre.'
            : origin ? `Distances from ${originLabel}.` : 'See which stay is closest to where you are.'

    return <div className={styles.home} lang={locale}>
        <div className={styles.arrival}>
            <section className={styles.arrivalHero} aria-labelledby="welcome-heading">
                <div className={styles.arrivalCopy}>
                    <p className={styles.arrivalEyebrow}><span className={styles.sun}><Sun size={17} /></span>{te ? `${cityName}కి స్వాగతం` : `HELLO, ${cityName.toUpperCase()}`}</p>
                    <h1 id="welcome-heading">{te ? 'కొత్త నగరం.' : 'A new city.'}<br /><em>{te ? 'మీ సొంత స్నేహితుడు.' : 'Your own local buddy.'}</em></h1>
                    <p className={styles.arrivalIntro}>{te ? 'మంచి వసతి, రుచికరమైన భోజనం, చూడదగిన ప్రదేశాలు. మీ మొదటి రోజు నుంచే తోడుగా ఉంటాం.' : 'A comfy stay. A good meal. A little exploring. Let’s make your first day feel a little more like home.'}</p>
                    <div className={styles.arrivalActions}><a href="#find-your-stay" className={styles.arrivalPrimary}><BedDouble size={19} />{te ? 'వసతి వెతకండి' : 'Find my stay'}<ArrowDown size={17} /></a><a href="#your-city" className={styles.arrivalSecondary}>{te ? 'నగరాన్ని చూద్దాం' : 'Show me around'}<ArrowRight size={17} /></a></div>
                    <div className={styles.buddySignature}><BuddyMascot pose="wave" className="h-12 w-12" /><div><strong>{te ? 'మొదటి రోజు నుంచే మీతో.' : 'A little guidance goes a long way.'}</strong><span>{te ? 'ఒక్కో అడుగు, మీకు నచ్చినట్లు.' : 'Take it one step at a time. We’ll help you along.'}</span></div></div>
                </div>
                <figure className={styles.arrivalPhoto}>
                    {cityName.toLowerCase() === 'eluru' ? <Image src="/images/cities/eluru-buddha-park.webp" alt="The lake and Buddha statue at Eluru’s Buddha Park" fill preload sizes="(max-width: 767px) 760px, 1440px" className={styles.arrivalImage} /> : <div className={styles.arrivalPlaceholder}><Building2 size={90} /><span>{cityName}</span></div>}
                    <span className={styles.photoPill}><MapPin size={14} />{te ? `మీరు చూస్తున్నది ${cityName}` : `YOUR NEXT CHAPTER: ${cityName.toUpperCase()}`}</span>
                    <figcaption className={styles.photoCaption}><span>{te ? 'నెమ్మదిగా తెలుసుకోండి.' : 'Unpack. Breathe.'}<br /><em>{te ? 'మీ నగరాన్ని ఆస్వాదించండి.' : 'Make yourself at home.'}</em></span><span className={styles.photoArrow} aria-hidden="true"><MapPin size={23} /></span></figcaption>
                </figure>
            </section>
            {cityName.toLowerCase() === 'eluru' && <p className={styles.arrivalCredit}>Buddha Park, Eluru · <a href="https://commons.wikimedia.org/wiki/File:Panorama_of_Buddha_Park,_Eluru.jpg" target="_blank" rel="noreferrer">IM3847</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a> · cropped</p>}
        </div>
        <BuddyNavigation placement="home" />

        <section id="find-your-stay" className={styles.staysSection} aria-labelledby="stays-heading">
            <TranslationNotice />
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{te ? 'ముందుగా వసతి' : 'FIRST THINGS FIRST'}</p><h2 id="stays-heading">{te ? 'మీకు నచ్చే చోటు ఎంచుకోండి.' : 'Put your bags down. Settle in.'}</h2><p>{te ? 'తేదీలు ఎంచుకోండి. వసతి వివరాలు చూసి నేరుగా మాట్లాడండి.' : 'Choose your dates, explore a stay and speak directly with the hotel.'}</p></div><Link href={`/hotels?${staySearchQuery(search)}`} className={styles.textLink}>Open stay directory<ArrowUpRight size={17} /></Link></div>
            <StaySearchForm key={staySearchQuery(search)} search={search} today={today} cityName={cityName} />
            <div className={styles.finder}>
                <div className={styles.types} role="group" aria-label="Choose a stay type">{kinds.map(({ id, label, te: translated, icon: Icon }) => <button type="button" key={id} aria-pressed={kind === id} className={kind === id ? styles.activeType : ''} onClick={() => { setKind(id); setQuery('') }}><Icon size={19} />{te ? translated : label}<span>{stays.filter(s => s.kind === id).length}</span></button>)}</div>
                <form onSubmit={findStay} className={styles.search}><Search size={20} /><label className="sr-only" htmlFor="home-stay-search">Search a hotel or neighbourhood</label><input id="home-stay-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a hotel or neighbourhood" /><button type="submit" aria-label="Find stays"><ArrowRight size={20} /></button></form>
            </div>
            <div className={styles.locationBar}><div><p><MapPin size={17} />{origin ? `Starting from ${originLabel}` : 'Let’s start where you are'}</p><span role="status">{locationMessage}</span></div>{locationControls}</div>
            <div className={styles.resultsHeader}><p aria-live="polite"><strong>{filtered.length} {filtered.length === 1 ? 'stay' : 'stays'}</strong> to explore in {cityName}</p><label>Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option value="name">Hotel name</option><option value="nearest" disabled={!origin}>Nearest first</option></select></label></div>
            {sort === 'nearest' && origin && <p className={styles.sortNote}>Nearest first uses straight-line distance. Open a stay for travel routes.</p>}
            <div className={styles.hotelGrid}>{filtered.map((stay, index) => <article key={stay.id} className={styles.hotelCard}>
                <div className={`${styles.cardTop} ${styles[`tone${index % 3}`]}`}>
                    <div><span className={styles.cardCategory}>YOUR {cityName.toUpperCase()} ADDRESS</span><p>{stay.area}</p><span className={styles.cardKind}><Building2 size={14} />Hotel</span></div>
                    <div className={styles.miniKey} aria-hidden="true"><span /><KeyRound size={28} /><b>{String(index + 1).padStart(2, '0')}</b></div>
                </div>
                <div className={styles.cardBody}>
                    <p className={styles.checked}><CheckCheck size={15} />{stay.review_due_at < today ? 'Online details due for recheck' : 'Details checked online'}</p>
                    <h3>{stay.name}</h3><p className={styles.cardAddress}><MapPin size={15} />{stay.address}</p>
                    <p className={styles.cardDistance}>{origin ? `${distanceKm(origin, { lat: stay.latitude, lng: stay.longitude }).toFixed(1)} km from ${originLabel} · straight line` : 'Set your location to see the distance'}</p>
                    <div className={styles.rate}><StayPriceStatus search={search} /></div>
                    <div className={styles.cardActions}><button type="button" onClick={() => setSelected(stay)} aria-label={`View ${stay.name} details and directions`}>View stay<ArrowRight size={17} /></button><a href={`tel:${stay.phone}`} aria-label={`Call ${stay.name}`}><Phone size={18} /></a></div>
                </div>
            </article>)}</div>
            {!filtered.length && <div className={styles.empty}><BedDouble size={36} /><h3>{query ? 'No stay matches that search.' : 'A little more local homework first.'}</h3><p>{query ? 'Try a different hotel name or neighbourhood.' : `We haven’t added checked ${kinds.find(k => k.id === kind)?.label.toLowerCase()} in ${cityName} yet. Our first hotel listings are ready to explore.`}</p><button type="button" onClick={() => { setKind('hotel'); setQuery('') }}>Show hotels<ArrowRight size={17} /></button></div>}
            <p className={styles.honestyNote}>A small collection to start. Online details are source-linked; rooms, prices and property conditions should be confirmed with the hotel.</p>
        </section>

        <section className={styles.nextChapter} aria-labelledby="next-heading">
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{te ? 'తర్వాత ఏమిటి?' : 'MAKE A DAY OF IT'}</p><h2 id="next-heading">{te ? 'వసతి దొరికిందా? తర్వాత చూద్దాం.' : 'Once you’ve settled in…'}</h2><p>{te ? 'మీకు నచ్చినట్లు నగరాన్ని తెలుసుకోండి.' : 'There’s a whole city waiting. Start with something simple.'}</p></div></div>
            <div className={styles.nextGrid}>{[
                { href: '/food', icon: Utensils, tag: 'SOMETHING DELICIOUS', tagTe: 'రుచికరమైన భోజనం', title: 'Find your first local bite.', titleTe: 'మంచి భోజనం ఎక్కడో చూద్దాం.', text: 'A quick snack or a sit-down meal. See your food options.', textTe: 'చిరుతిండి లేదా భోజనం. మీ ఎంపికలు చూడండి.', cta: 'Let’s eat', ctaTe: 'భోజనం చూద్దాం' },
                { href: '/transport', icon: Bus, tag: 'A LITTLE CONFIDENCE', tagTe: 'సులభమైన ప్రయాణం', title: 'Know your way around.', titleTe: 'ప్రయాణ మార్గాలు తెలుసుకోండి.', text: 'Walk, auto, car or bus. Work out how to reach your next stop.', textTe: 'నడక, ఆటో, కారు లేదా బస్సు. మీ గమ్యం చేరుకోండి.', cta: 'Plan a trip', ctaTe: 'ప్రయాణం ప్లాన్ చేయండి' },
                { href: '/attractions', icon: Compass, tag: 'ROOM FOR DISCOVERY', tagTe: 'కొత్త ప్రదేశాలు', title: 'Meet your new city.', titleTe: 'మీ కొత్త నగరాన్ని చూడండి.', text: 'Find somewhere to pause, wander and get to know the place.', textTe: 'విశ్రాంతి, సందర్శన కోసం ప్రదేశాలు చూడండి.', cta: 'Go explore', ctaTe: 'ప్రదేశాలు చూడండి' },
            ].map(({href, icon: Icon, tag, tagTe, title, titleTe, text, textTe, cta, ctaTe}) => <Link href={href} key={href} className={styles.nextCard}><div className={styles.nextCardTop}><Icon size={30} strokeWidth={1.4} /><ArrowUpRight size={20} /></div><span>{te ? tagTe : tag}</span><h3>{te ? titleTe : title}</h3><p>{te ? textTe : text}</p><strong>{te ? ctaTe : cta}<ArrowRight size={16} /></strong></Link>)}</div>
        </section>

        <section className={styles.buddyNote} aria-labelledby="buddy-note-heading"><div className={styles.noteIcon}><KeyRound size={34} /></div><div><p className={styles.eyebrow}>A NOTE FROM YOUR BUDDY</p><h2 id="buddy-note-heading">A quick call. A smoother arrival.</h2><p>Ask for the total room price, check-in time and a nearby landmark. Moving here for college? Ask about monthly rent, meals and the deposit, too.</p></div><div className={styles.noteChecklist}><span><Check size={16} />Confirm the room</span><span><Check size={16} />Save the address</span><span><Check size={16} />You’re ready to arrive</span></div></section>
        <div className={styles.closing}><Sun size={20} /><p>First a place to stay. Then a city to call your own.</p><Link href="/food" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#204b3c] px-5 text-sm font-semibold text-white">Stay sorted? Let’s find food<ArrowRight size={17} /></Link></div>

        {selected && <AccessibleDialog label={`${selected.name} — details and directions`} onClose={() => setSelected(null)}>
            <p className={styles.eyebrow}>YOUR STAY IN {cityName.toUpperCase()}</p><h2 className={styles.dialogTitle}>{selected.name}</h2><p className={styles.dialogCopy}>{selected.address}</p><p className={styles.dialogCopy}>{selected.summary}</p>
            <div className="my-4"><StayPriceStatus search={search} /></div>
            <div className={styles.dialogLocation}><p role="status">{locationMessage}</p>{locationControls}</div>
            <TravelOptions stay={selected} origin={origin} label={originLabel} />
            <a className={styles.dialogCall} href={`tel:${selected.phone}`}><Phone size={18} />Call hotel · {selected.phone}</a>
            <p className={styles.dialogCopy}>Your enquiry: {searchSummary(search)}. Ask for the total price for all rooms, taxes and check-in time.</p>
            <details className={styles.sources}><summary>{selected.review_due_at < today ? 'Details due for recheck' : 'Checked online'} · {selected.checked_at} · Sources</summary><p>Name, address and phone: <a href={selected.source_url} target="_blank" rel="noreferrer">{selected.source_name}</a>. Online check only; no property inspection.</p><p>{selected.coordinate_note} <a href={selected.coordinate_source_url} target="_blank" rel="noreferrer">Map source</a></p><p>Review due: {selected.review_due_at}</p></details>
        </AccessibleDialog>}
    </div>
}
