'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, BedDouble, Building2, Bus, Car, Check, Footprints, GraduationCap, House, LocateFixed, MapPin, Navigation, Phone, Search, Truck } from 'lucide-react'
import { useLocation } from '@/site/components/location-provider'
import { LocalText, TranslationNotice } from '@/site/components/LocalText'
import { distanceKm, formatDuration, type Coords } from '@/site/lib/geo'
import type { Stay } from './data'
import { StaySearchForm, StayPriceStatus } from './StaySearchForm'
import { staySearchQuery, type StaySearch } from './search'

const types = [
 {id:'all',label:'All stays',hint:'Explore your options',icon:BedDouble},
 {id:'hotel',label:'Hotels',hint:'Short visits & family trips',icon:Building2},
 {id:'oyo',label:'OYO rooms',hint:'Branded room listings',icon:BedDouble},
 {id:'hostel',label:'Hostels & PGs',hint:'Student & shared living',icon:GraduationCap},
 {id:'room',label:'Individual rooms',hint:'A space of your own',icon:House},
] as const
const modes = [{id:'walk',label:'Walk',icon:Footprints},{id:'car',label:'Car',icon:Car},{id:'auto',label:'Auto',icon:Truck},{id:'bus',label:'Bus',icon:Bus}] as const
type Mode = typeof modes[number]['id']
type Route = {km:number;minutes:number}
type Destination = Pick<Stay, 'name' | 'address' | 'latitude' | 'longitude'>
function mapsUrl(stay:Destination, mode:Mode, origin:Coords|null) {
 const p = new URLSearchParams({api:'1',destination:`${stay.name}, ${stay.address}`,travelmode:mode==='walk'?'walking':mode==='bus'?'transit':'driving'})
 if(origin) p.set('origin',`${origin.lat},${origin.lng}`)
 return `https://www.google.com/maps/dir/?${p}`
}

export function TravelOptions({stay,origin,label}:{stay:Destination;origin:Coords|null;label:string}) {
 const [routes,setRoutes] = useState<Record<string,Route|null>>({})
 const destinationKey = `${stay.latitude},${stay.longitude}`
 const originKey = origin ? `${origin.lat},${origin.lng}` : ''
 useEffect(()=>{
  if(!originKey) return
  const controller = new AbortController()
  const [lat,lng]=originKey.split(',')
  for(const mode of modes) {
   const key=`${originKey}:${destinationKey}:${mode.id}`
   const p=new URLSearchParams({fromLat:lat,fromLng:lng,toLat:String(stay.latitude),toLng:String(stay.longitude),mode:mode.id})
   fetch(`/api/directions?${p}`,{signal:controller.signal})
    .then(async r=>{if(!r.ok) throw new Error('Unavailable'); return r.json()})
    .then(r=>{if(!Number.isFinite(r.km)||!Number.isFinite(r.minutes)) throw new Error('Invalid route'); setRoutes(old=>({...old,[key]:r}))})
    .catch(()=>{if(!controller.signal.aborted) setRoutes(old=>({...old,[key]:null}))})
  }
  return ()=>controller.abort()
 },[originKey,destinationKey,stay.latitude,stay.longitude])
 const direct=origin?distanceKm(origin,{lat:stay.latitude,lng:stay.longitude}):null
 return <div className="rounded-2xl bg-[#f5f7f4] p-4">
  <p className="flex items-center gap-2 text-sm font-semibold"><Navigation size={15}/>{origin?`From ${label}`:'How will you get here?'}</p>
  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
   {modes.map(({id,label:modeLabel,icon:Icon})=>{
    const route=routes[`${originKey}:${destinationKey}:${id}`]
    return <a key={id} href={mapsUrl(stay,id,origin)} target="_blank" rel="noreferrer" aria-label={`${modeLabel} directions to ${stay.name} in Google Maps`} className="rounded-xl border border-ink/10 bg-white p-3 transition hover:border-teal-brand focus-visible:outline-2 focus-visible:outline-teal-brand">
     <span className="flex items-center gap-1.5 text-sm text-ink-soft"><Icon size={16}/>{modeLabel}<ArrowUpRight size={12} className="ml-auto"/></span>
     <span className="mt-2 block text-sm font-bold">{!origin?'Set location':route?`${route.km.toFixed(1)} km`:route===null?'Check in Maps':'Finding route…'}</span>
     <span className="mt-1 block text-xs text-ink-soft">{route?`About ${formatDuration(route.minutes)}`:id==='bus'?'Routes & bus times':id==='auto'?'Driving route for auto':'Directions in Maps'}</span>
    </a>
   })}
  </div>
  <p className="mt-3 text-xs leading-relaxed text-ink-soft">{direct!==null?`${direct.toFixed(1)} km in a straight line. `:''}Routes: Google Maps / OpenStreetMap & OSRM. Times exclude live traffic. Auto uses a car route; confirm the fare with the driver. Bus results depend on published services.</p>
 </div>
}

export function StayDirectory({stays,cityName,today,search}:{stays:Stay[];cityName:string;today:string;search:StaySearch}) {
 const [kind,setKind]=useState('all')
 const [query,setQuery]=useState('')
 const [sort,setSort]=useState('name')
 const location=useLocation()
 const origin=location.startPoint?.coords??null
 const originLabel=location.startPoint?.kind==='user'?'your location':location.startPoint?.label??''
 const filtered=stays.filter(s=>(kind==='all'||s.kind===kind)&&`${s.name} ${s.area} ${s.address}`.toLowerCase().includes(query.trim().toLowerCase()))
 filtered.sort((a,b)=>sort==='nearest'&&origin?distanceKm(origin,{lat:a.latitude,lng:a.longitude})-distanceKm(origin,{lat:b.latitude,lng:b.longitude}):a.name.localeCompare(b.name))
 return <div className="bg-[#fcfbf7] text-ink">
  <div className="mx-auto max-w-6xl px-5 pb-16 pt-7 sm:px-8">
   <nav aria-label="Breadcrumb" className="mb-7 flex gap-2 text-sm text-ink-soft"><Link href={`/?${staySearchQuery(search)}`} className="hover:underline">Explore {cityName}</Link><span aria-hidden="true">/</span><span className="font-semibold text-teal-brand">Stay</span></nav>
   <section className="relative overflow-hidden rounded-[28px] bg-[#163e35] px-6 py-9 text-white sm:px-10 sm:py-12">
    <div aria-hidden="true" className="absolute -right-8 -top-12 h-72 w-72 rounded-full border-[40px] border-white/5"/>
    <div className="relative max-w-2xl"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#c6deab]">YOUR LOCAL BUDDY · {cityName}</p>
     <h1 className="font-display text-4xl leading-tight sm:text-5xl"><LocalText en="New here? Feel at home." te="కొత్తగా వచ్చారా? ఇంటిలా ఉండండి."/></h1>
     <p className="mt-4 max-w-xl text-base leading-7 text-white/80">A room for tonight or a place for your next chapter. Let’s find your stay in {cityName}, one simple step at a time.</p>
     <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#e3edcf]"><span className="flex items-center gap-2"><Check size={16}/>Source-linked details</span><span className="flex items-center gap-2"><Phone size={15}/>Contact hotels directly</span></div>
    </div>
   </section>
   <Link href="/food" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-teal-brand">Already have a stay? Find food<ArrowUpRight size={16} /></Link>
   <TranslationNotice/>
   <StaySearchForm key={staySearchQuery(search)} search={search} today={today} cityName={cityName} />
   <section aria-labelledby="stay-type" className="mt-9">
    <h2 id="stay-type" className="text-xl font-semibold">What kind of stay do you need?</h2>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
     {types.map(({id,label,hint,icon:Icon})=><button type="button" key={id} aria-pressed={kind===id} onClick={()=>setKind(id)} className={`min-h-28 rounded-2xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand ${kind===id?'border-[#245b4c] bg-[#eaf0e5] ring-1 ring-[#245b4c]':'border-ink/10 bg-white hover:border-teal-brand'}`}><Icon size={23} className="mb-3 text-teal-brand"/><span className="block text-sm font-bold">{label}</span><span className="mt-1 block text-xs leading-5 text-ink-soft">{hint}</span></button>)}
    </div>
   </section>
   <section aria-label="Your starting point" className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-[#dce6d5] bg-[#f0f4eb] p-5">
    <div className="rounded-full bg-white p-3 text-teal-brand"><MapPin size={22}/></div>
    <div className="min-w-0 flex-1"><h2 className="font-semibold">{origin?`Starting from ${originLabel}`:'See how far each stay is from you'}</h2><p className="mt-1 text-sm text-ink-soft">{location.status==='denied'?'Location is blocked. Enable it in browser settings or use the city centre.':location.status==='error'||location.status==='unavailable'?'We couldn’t get your location. Try again or use the city centre.':origin?'Compare travel distances below. Refresh your location if you move.':'Use your location to compare walk, car, auto and bus routes.'}</p></div>
    <div className="flex flex-wrap gap-2"><button type="button" onClick={location.request} disabled={location.status==='locating'} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#245b4c] px-4 text-sm font-semibold text-white disabled:opacity-60"><LocateFixed size={17}/>{location.status==='locating'?'Finding you…':origin?'Refresh location':'Use my location'}</button>{location.cityCentre&&<button type="button" onClick={location.chooseCentre} className="min-h-11 rounded-xl border border-ink/20 px-3 text-sm font-medium">Use city centre</button>}</div>
   </section>
   <div className="mt-8 flex flex-col gap-3 sm:flex-row"><label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-ink/15 bg-white px-4 focus-within:ring-2 focus-within:ring-teal-brand"><Search size={19} className="text-ink-soft"/><span className="sr-only">Search stays by name or area</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search a hotel or area…" className="min-w-0 flex-1 bg-transparent py-3 outline-none"/></label><label className="flex items-center gap-2 text-sm">Sort by<select value={sort} onChange={e=>setSort(e.target.value)} className="min-h-12 rounded-xl border border-ink/15 bg-white px-3"><option value="name">Hotel name</option><option value="nearest" disabled={!origin}>Nearest first</option></select></label></div>
   <div className="mt-7 grid items-start gap-7 lg:grid-cols-[1fr_260px]">
    <section aria-label="Stay results" className="min-w-0"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold" aria-live="polite">{filtered.length} {filtered.length===1?'stay':'stays'} in {cityName}</h2><span className="text-xs text-ink-soft">{sort==='nearest'?'Sorted by straight-line distance':'A small start, carefully checked'}</span></div>
     <div className="space-y-5">{filtered.map(stay=><article key={stay.id} className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4"><div aria-hidden="true" className="hidden rounded-2xl bg-[#f1e8db] p-4 text-[#806746] sm:block"><Building2 size={28}/></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-widest text-teal-brand">{types.find(t=>t.id===stay.kind)?.label} · {stay.area}</p><h3 className="mt-2 text-2xl font-semibold tracking-tight">{stay.name}</h3><p className="mt-2 text-sm leading-6 text-ink-soft">{stay.address}</p></div></div>
      <p className="my-4 text-sm leading-6 text-ink-soft">{stay.summary}</p>
      <TravelOptions stay={stay} origin={origin} label={originLabel}/>
      <div className="my-5 flex flex-wrap items-center justify-between gap-3"><StayPriceStatus search={search} /><a href={`tel:${stay.phone}`} aria-label={`Call ${stay.name}`} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#245b4c] px-5 text-sm font-semibold text-white hover:bg-[#163e35]"><Phone size={16}/>Call hotel</a></div>
      <details className="border-t border-ink/10 pt-4 text-xs leading-6 text-ink-soft"><summary className="cursor-pointer text-sm font-medium text-teal-brand">{stay.review_due_at<today?'Details due for recheck':'Checked online'} · {stay.checked_at} · View sources</summary><p className="mt-2">Name, address and phone checked against <a className="underline" href={stay.source_url} target="_blank" rel="noreferrer">{stay.source_name}</a>. Online check only; no property inspection or live availability check.</p><p>{stay.coordinate_note} <a className="underline" href={stay.coordinate_source_url} target="_blank" rel="noreferrer">Map source</a></p><p>Phone: <a href={`tel:${stay.phone}`} className="underline">{stay.phone}</a> · Recheck due {stay.review_due_at}</p></details>
     </article>)}</div>
     {filtered.length===0&&<div className="rounded-3xl border border-dashed border-ink/20 bg-white px-6 py-12 text-center"><BedDouble className="mx-auto mb-4 text-teal-brand" size={34}/><h3 className="text-xl font-semibold">{query?'No matching stays yet':`No ${types.find(t=>t.id===kind)?.label.toLowerCase()??'stays'} listed yet`}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">{query?'Try another hotel name or area.':'We’re starting with three hotels in Eluru. More stay types will appear here after their details are checked.'}</p><button type="button" onClick={()=>{setKind('all');setQuery('')}} className="mt-5 min-h-11 rounded-xl bg-[#245b4c] px-5 text-sm font-semibold text-white">Show all stays</button></div>}
    </section>
    <aside className="space-y-5 lg:pt-11"><div className="rounded-3xl bg-[#f3eadb] p-6"><span className="text-2xl" aria-hidden="true">☀</span><p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#806746]">A little local advice</p><h2 className="mt-3 font-display text-2xl">Call first. Arrive easy.</h2><p className="mt-3 text-sm leading-6 text-ink-soft">Before you set off, ask about the final price, check-in time and the nearest landmark. It makes finding your room much easier.</p></div><div className="rounded-3xl border border-ink/10 p-6"><GraduationCap className="text-teal-brand"/><h2 className="mt-3 font-semibold">Moving here to study?</h2><p className="mt-2 text-sm leading-6 text-ink-soft">For a hostel or room, ask about monthly rent, deposit, meals, curfew and distance to your college.</p><button type="button" onClick={()=>{setKind('hostel');setQuery('')}} className="mt-4 min-h-11 text-sm font-bold text-teal-brand underline underline-offset-4">Explore hostels & PGs</button></div></aside>
   </div>
  </div>
 </div>
}
