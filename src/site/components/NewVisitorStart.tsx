'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Compass, Utensils, Bed, MapPin } from 'lucide-react'
import { PlaceImage } from './PlaceImage'
import { useChrome } from './locale-provider'
import type { HeroPlace } from './HomeHero'

const needs = [
    {id:'explore', label:'Show me around', te:'నగరాన్ని చూద్దాం', hint:'Get to know a place', icon:Compass},
    {id:'food', label:'Find something to eat', te:'భోజనం కావాలి', hint:'Restaurants and cafés', icon:Utensils},
    {id:'stay', label:'Find a place to stay', te:'వసతి కావాలి', hint:'Hotels and guest houses', icon:Bed},
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
export function NewVisitorStart({cityName,places}: {cityName:string; places:HeroPlace[]}) {
    const [need,setNeed]=useState<string>('explore')
    const {locale}=useChrome(); const te=locale==='te'
    const matches=places.filter(p=>{
        const category=p.category_name.toLowerCase()
        const food=/restaurant|cafe|food|quick bites/.test(category),stay=/hotel|stay|guest house/.test(category)
        return need==='food'?food:need==='stay'?stay:!food&&!stay
    }).sort((a,b)=>Number(b.slug==='eluru-buddha-park')-Number(a.slug==='eluru-buddha-park'))
    const shown=matches.slice(0,3)
    return <section id="start-here" lang={locale} aria-labelledby="new-visitor-heading" className="scroll-mt-6 border-b border-hairline bg-white py-7 sm:py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <p className="text-sm font-semibold text-teal-brand-dark">{te?'మీ మొదటి సందర్శనకు సహాయం':'Your first visit, made simpler'}</p>
            <h2 id="new-visitor-heading" className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{te?'ముందుగా మీకు ఏం కావాలి?':'What would help you right now?'}</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">{te?`${cityName}లో పేర్లు తెలియకపోయినా పరవాలేదు. మీ అవసరాన్ని ఎంచుకోండి; ప్రదేశాలు, ప్రయాణ వివరాలు చూద్దాం.`:`You don’t need to know ${cityName} yet. Tell me what you need, and we’ll choose one place and work out how to get there.`}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3" role="group" aria-label={te?'మీకు కావాల్సిన సహాయం':'What you need'}>{needs.map(item=><button key={item.id} type="button" aria-pressed={need===item.id} onClick={()=>setNeed(item.id)} className={`flex min-h-20 items-center gap-3 rounded-2xl border p-4 text-left focus-visible:outline-2 focus-visible:outline-teal-brand ${need===item.id?'border-teal-brand bg-teal-wash':'border-hairline hover:bg-cream'}`}><item.icon className="size-5 shrink-0 text-teal-brand-dark" aria-hidden="true" /><span><span className="block font-semibold text-ink">{te?item.te:item.label}</span>{!te&&<span className="mt-1 block text-sm text-ink-soft">{item.hint}</span>}</span></button>)}</div>
            <p role="status" className="mt-5 text-sm text-ink-soft">{shown.length ? (te?`${shown.length} ఎంపికలు — ఒకదానితో మొదలుపెట్టండి.`:`${shown.length} places to consider. Pick one to start; you can change it later.`) : (te?'ఈ విభాగంలో ఇంకా సమాచారం లేదు.':'We don’t have published places for this need yet. Try another option.')}</p>
            <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map(place=><article key={place.id} className="overflow-hidden rounded-2xl border border-hairline bg-white">
                <div className="relative aspect-[16/10]"><PlaceImage src={place.primary_image} alt={place.primary_image_alt} name={place.short_name} category={place.category_name} sizes="(max-width:640px) 100vw, 33vw" /></div>
                <div className="p-4"><p className="text-xs font-semibold text-teal-brand-dark">{place.category_name} · {cityName}</p><h3 className="mt-2 text-xl font-semibold text-ink">{place.short_name}</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{introduction(place)}</p>
                <Link href={`/guide?place=${encodeURIComponent(place.slug)}`} className="buddy-primary mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-teal-brand">{te?'ఇక్కడికి వెళ్లేందుకు సహాయం':'Help me visit this place'}<ArrowRight className="size-4" aria-hidden="true" /></Link>
                <Link href={`/attractions/${place.slug}`} className="mt-1 inline-flex min-h-11 items-center rounded text-sm font-semibold text-teal-brand-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand">{te?'ముందుగా వివరాలు చూడండి':'What should I know first?'}</Link></div>
            </article>)}</div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream p-4 text-sm text-ink-soft"><p className="flex items-center gap-2"><MapPin className="size-4 shrink-0" aria-hidden="true" />{te?'స్థాన అనుమతి అవసరం లేదు. ప్రయాణానికి నగర కేంద్రాన్ని ఉపయోగించవచ్చు.':'No location permission needed to explore. For directions, you can start from the city centre.'}</p><Link href="/emergency" className="inline-flex min-h-11 items-center rounded font-semibold text-teal-brand-dark underline focus-visible:outline-2 focus-visible:outline-teal-brand">{te?'అత్యవసర సహాయం':'Need urgent help?'}</Link></div>
        </div>
    </section>
}
