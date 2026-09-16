'use client'

import { VerificationBadge } from './VerificationBadge'
import { SavePlaceButton } from './SavedPlaces'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Compass, Utensils, Bed, MapPin } from 'lucide-react'
import { PlaceImage } from './PlaceImage'
import { useChrome } from './locale-provider'
import type { HeroPlace } from './HomeHero'
import { pricingKind } from '@/site/verification/model'
import type { Verification } from '@/site/verification/model'

const needs = [
    {id:'explore', label:'Show me around', te:'నగరాన్ని చూద్దాం', hint:'Get to know a place', icon:Compass},
    {id:'food', label:'Find food', te:'భోజనం కావాలి', hint:'Restaurants and cafés', icon:Utensils},
    {id:'stay', label:'Find a stay', te:'వసతి కావాలి', hint:'Hotels and guest houses', icon:Bed},
] as const
function introduction(place: HeroPlace) {
    if (!place.short_description.includes('Visiting details have not yet been verified')) return place.short_description
    const category = place.category_name.toLowerCase()
    if (/restaurant|cafe|food|quick bites/.test(category)) return 'An option for a food stop. Check the menu, prices and opening hours before heading over.'
    if (/hotel|stay|guest house/.test(category)) return 'An accommodation option to check. Confirm rooms, rates and check-in directly before travelling.'
    if (/religious|temple/.test(category)) return 'A place of worship. Check visiting hours, access and local customs before your visit.'
    if (/park|garden/.test(category)) return 'An outdoor place to consider for your visit. Opening hours, entry fees and facilities need confirmation.'
    return 'A mapped place to explore. Check the visiting details, then let Buddy help you find the way.'
}
export function NewVisitorStart({cityName,places}: {cityName:string; places:(HeroPlace & {verification: Verification})[]}) {
    const [need,setNeed]=useState<string>('explore')
    const {locale}=useChrome(); const te=locale==='te'
    const matches=places.filter(p=>{
        const category=p.category_name.toLowerCase()
        const kind = pricingKind(category)
        const food = kind === 'food', stay = kind === 'stay'
        if (kind === 'retail') return false
        return need==='food'?food:need==='stay'?stay:!food&&!stay
    }).sort((a,b)=>Number(b.slug==='eluru-buddha-park')-Number(a.slug==='eluru-buddha-park'))
    const shown=matches.slice(0,3)
    return <section id="start-here" lang={locale} aria-labelledby="new-visitor-heading" className="scroll-mt-6 border-b border-hairline bg-white py-7 sm:py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 id="new-visitor-heading" className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{te?'ముందుగా మీకు ఏం కావాలి?':'What sounds good today?'}</h2>

            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label={te?'మీకు కావాల్సిన సహాయం':'What you need'}>{needs.map(item=><button key={item.id} type="button" aria-pressed={need===item.id} onClick={()=>setNeed(item.id)} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-sm sm:flex-row sm:justify-start sm:gap-3 sm:p-4 sm:text-left sm:text-base focus-visible:outline-2 focus-visible:outline-teal-brand ${need===item.id?'border-teal-brand bg-teal-wash':'border-hairline hover:bg-cream'}`}><item.icon className="size-5 shrink-0 text-teal-brand-dark" aria-hidden="true" /><span><span className="block font-semibold text-ink">{te?item.te:item.label}</span>{!te&&<span className="mt-1 hidden text-sm text-ink-soft sm:block">{item.hint}</span>}</span></button>)}</div>
            <p role="status" className="mt-5 text-sm text-ink-soft">{shown.length ? (te?`${shown.length} ఎంపికలు — ఒకదానితో మొదలుపెట్టండి.`:`${shown.length} ${shown.length === 1 ? 'place' : 'places'} to start with. Explore now or save for later.`) : (te?'ఈ విభాగంలో ఇంకా సమాచారం లేదు.':'We don’t have published places for this need yet. Try another option.')}</p>
            <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map(place=><article key={place.id} className="group relative grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-2xl border border-hairline bg-white p-3 sm:block sm:overflow-hidden sm:p-0">
                <div className="relative h-28 overflow-hidden rounded-xl sm:aspect-[16/10] sm:h-auto sm:rounded-none"><PlaceImage src={place.primary_image} alt={place.primary_image_alt} name={place.short_name} category={place.category_name} sizes="(max-width:640px) 96px, 33vw" /></div>
                <div className="min-w-0 sm:p-4"><p className="text-xs font-semibold text-teal-brand-dark">{place.category_name} · {cityName}</p><h3 className="mt-2 text-xl font-semibold text-ink"><Link href={`/attractions/${place.slug}`} className="rounded outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-teal-brand focus-visible:after:ring-offset-2">{place.short_name}</Link></h3><VerificationBadge verification={place.verification} compact /><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{introduction(place)}</p>
                </div>
                <div className="col-span-2 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-2 sm:mx-4 sm:mb-4">
                    <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-brand-dark group-hover:underline">{te?'వివరాలు చూడండి':'Explore this place'}<ArrowRight className="size-4" aria-hidden="true" /></span>
                    <SavePlaceButton compact place={{id:place.id,name:place.short_name,slug:place.slug,city:cityName}} />
                </div>
            </article>)}</div>
            <Link href={need === 'food' ? '/food' : need === 'stay' ? '/hotels' : '/attractions'} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-teal-brand-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand">{te ? 'అన్ని ఎంపికలు చూడండి' : need === 'food' ? 'See all food spots' : need === 'stay' ? 'See all stays' : 'See all places'}<ArrowRight className="size-4" aria-hidden="true" /></Link>
            <p className="mt-2 text-sm text-ink-soft"><Link href="/services" className="inline-flex min-h-11 items-center rounded font-semibold text-teal-brand-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand">{te ? 'ఆసుపత్రులు, స్థానిక సేవలు కావాలా?' : 'Need hospitals or local services?'}</Link></p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream p-4 text-sm text-ink-soft"><p className="flex items-center gap-2"><MapPin className="size-4 shrink-0" aria-hidden="true" />{te?'ప్రదేశాన్ని ఎంచుకున్నారా? అక్కడికి ఎలా వెళ్లాలో చూద్దాం.':'Found your place? Let’s work out how to get there.'}</p><Link href="/guide" className="inline-flex min-h-11 items-center rounded font-semibold text-teal-brand-dark underline focus-visible:outline-2 focus-visible:outline-teal-brand">{te?'ప్రయాణం ప్లాన్ చేయండి':'Plan my visit'}</Link></div>
        </div>
    </section>
}
