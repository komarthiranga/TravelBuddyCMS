'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Phone, MapPin, ExternalLink, BookOpen } from 'lucide-react'
import { useChrome } from './locale-provider'
import type { LocalService } from '@/site/services/data'
import { filterServices, servicePhone } from '@/site/services/filter'
const categories=[['','All services','అన్ని సేవలు'],['hospitals','Hospitals','ఆసుపత్రులు'],['helplines','Helplines','సహాయ నంబర్లు'],['civic','Civic services','పౌర సేవలు'],['postal','Post offices','తపాలా కార్యాలయాలు'],['colleges','Colleges','కళాశాలలు'],['schools','Schools','పాఠశాలలు'],['banks','Banks','బ్యాంకులు'],['electricity','Electricity','విద్యుత్']] as const
const areas:Record<string,[string,string]>={city:['In the city','నగరంలో'],district:['Wider district / nearby area','జిల్లా / సమీప ప్రాంతం'],regional:['Regional office','ప్రాంతీయ కార్యాలయం'],national:['Across India','భారతదేశం అంతటా']}
export function ServicesDirectory({cityName,services,loadedAt}:{cityName:string;services:LocalService[];loadedAt:number}) {
    const {locale}=useChrome();const te=locale==='te'
    const [category,setCategory]=useState('');const [area,setArea]=useState('city');const [query,setQuery]=useState('');const [limit,setLimit]=useState(12)
    const results=filterServices(services,category,area,query)
    const reset=()=>{setCategory('');setArea('city');setQuery('');setLimit(12)}
    return <div lang={locale} className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
        <p className="text-sm font-semibold text-teal-brand-dark">{cityName}</p>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{te?'అవసరమైన స్థానిక సేవలు':'Useful services, when you need them'}</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-ink-soft">{te?'ఆసుపత్రులు, పౌర సేవలు, ఇతర సంప్రదింపు వివరాలను చూడండి. నగరంలోని సేవలు ముందుగా కనిపిస్తాయి; జిల్లా సేవలకు ఫిల్టర్ మార్చండి.':'Find hospitals, civic services and useful contacts. Start with the city, or include the wider district when you need more options.'}</p>
        <Link href="/emergency" className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-ink px-4 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand"><Phone className="size-4" aria-hidden="true" />{te?'అత్యవసర సహాయం — 112':'Emergency help — 112'}</Link>
        <div className="mt-6 grid gap-3 rounded-2xl border border-hairline bg-white p-4 sm:grid-cols-3">
            <label className="text-sm font-semibold">{te?'పేరు లేదా ప్రాంతం':'Name or area'}<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setLimit(12)}} placeholder={te?'ఉదా: ఆసుపత్రి పేరు':'Search a name, area or PIN code'} className="mt-2 min-h-12 w-full rounded-lg border border-hairline px-3 text-base font-normal focus-visible:outline-2 focus-visible:outline-teal-brand" /></label>
            <label className="text-sm font-semibold">{te?'సేవ రకం':'Type of service'}<select value={category} onChange={e=>{setCategory(e.target.value);setLimit(12)}} className="mt-2 min-h-12 w-full rounded-lg border border-hairline bg-white px-3 text-base font-normal focus-visible:outline-2 focus-visible:outline-teal-brand">{categories.map(([value,en,telugu])=><option key={value} value={value}>{te?telugu:en}</option>)}</select></label>
            <label className="text-sm font-semibold">{te?'ఏ ప్రాంతం?':'Where?'}<select value={area} onChange={e=>{setArea(e.target.value);setLimit(12)}} className="mt-2 min-h-12 w-full rounded-lg border border-hairline bg-white px-3 text-base font-normal focus-visible:outline-2 focus-visible:outline-teal-brand"><option value="city">{te?'నగరం + జాతీయ సేవలు':'City + national services'}</option><option value="all">{te?'జిల్లా సేవలు కూడా':'Include wider district'}</option></select></label>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{te?'మూలం: అధికారిక ప్రజా డైరెక్టరీలు. కార్యాలయ సమయాలు, ఫోన్ సేవల అందుబాటును నేరుగా తనిఖీ చేయలేదు.':'Sources: official public directories. Listing checks do not confirm opening hours, live phone availability or service quality.'}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p role="status" className="text-sm text-ink-soft">{results.length} {te?'సేవలు':'services found'}</p><button type="button" onClick={reset} className="min-h-11 rounded px-2 text-sm font-semibold text-teal-brand-dark underline focus-visible:outline-2 focus-visible:outline-teal-brand">{te?'ఫిల్టర్లు తొలగించండి':'Reset filters'}</button></div>
        {!results.length && <div className="mt-3 rounded-xl border border-dashed border-hairline p-6"><h2 className="text-lg font-semibold">{te?'ఇంకా సేవలు కనిపించలేదు':'No services found here yet'}</h2><p className="mt-2 text-ink-soft">{te?'మరో పేరు ప్రయత్నించండి లేదా జిల్లా సేవలు కూడా ఎంచుకోండి. కొన్ని వివరాలు సమీక్షలో ఉన్నాయి.':'Try another search or include the wider district. Some source entries are still under review; this is not a complete directory.'}</p></div>}
        <ul className="mt-3 grid gap-4 md:grid-cols-2">{results.slice(0,limit).map(service=>{
            const phone=servicePhone(service,loadedAt);const fresh=Date.parse(service.review_due_at)>loadedAt;const scope=areas[service.area]
            const safeSource=service.source_url.startsWith('https://')?service.source_url:null
            const map=service.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.name+', '+service.address)}`:null
            return <li key={service.id} className="min-w-0 rounded-2xl border border-hairline bg-white p-5">
                <p className="text-xs font-semibold text-teal-brand-dark">{categories.find(c=>c[0]===service.category)?.[te?2:1]} · {scope?.[te?1:0]}</p>
                <h2 lang="en" className="mt-2 text-xl font-semibold text-ink">{service.name}</h2>
                {service.address && <p lang="en" className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-ink-soft"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{service.address}</p>}
                {!service.address && service.category!=='helplines' && <p className="mt-3 text-sm text-ink-soft">{te?'మూలంలో వీధి చిరునామా లేదు.':'The source does not provide a street address.'}</p>}
                <div className="mt-3 flex flex-wrap gap-3">{phone && <a href={phone} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-wash px-3 text-sm font-semibold text-teal-brand-dark focus-visible:outline-2 focus-visible:outline-teal-brand"><Phone className="size-4" aria-hidden="true" />{service.phone}</a>}{map && <a href={map} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-teal-brand-dark underline focus-visible:outline-2 focus-visible:outline-teal-brand">{te?'Mapsలో వెతకండి':'Find in Maps'}<ExternalLink className="size-3.5" aria-hidden="true" /><span className="sr-only">{te?' (కొత్త ట్యాబ్)':' (opens a new tab)'}</span></a>}</div>
                {service.category==='hospitals' && <p className="mt-2 text-sm text-ink-soft">{te?'అత్యవసర విభాగం అందుబాటు తనిఖీ చేయలేదు. అత్యవసర సహాయానికి 112కు కాల్ చేయండి.':'Emergency-department availability is not established by this listing. For urgent help, call 112.'}</p>}
                <div className="mt-4 border-t border-hairline pt-2 text-xs text-ink-soft">{safeSource && <a href={safeSource} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded font-semibold text-teal-brand-dark underline focus-visible:outline-2 focus-visible:outline-teal-brand"><BookOpen className="size-4" aria-hidden="true" />{te?'అధికారిక మూలం':'Official source'}<span className="sr-only">{te?' (కొత్త ట్యాబ్)':' (opens a new tab)'}</span></a>}<p>{te?'మూలం చూసిన తేదీ: ':'Source reviewed: '}{new Date(service.checked_at).toISOString().slice(0,10)}{!fresh && (te?' · మళ్లీ తనిఖీ చేయాలి':' · Due for another check')}</p></div>
            </li>
        })}</ul>
        {results.length>limit && <button type="button" onClick={()=>setLimit(value=>value+12)} className="buddy-primary mt-5 min-h-12 rounded-xl px-5 font-semibold focus-visible:outline-2 focus-visible:outline-teal-brand">{te?'మరిన్ని సేవలు':'Show more services'}</button>}
        <p className="mt-6 text-sm leading-relaxed text-ink-soft">{te?'ఈ జాబితా అన్ని సేవలను కలిగి ఉండకపోవచ్చు. పాత జిల్లా పేర్లు మూల చిరునామాల్లో ఉండవచ్చు. Maps ఫలితాలు ప్రవేశ స్థానం నిర్ధారణ కాదు.':'Coverage is still growing. Older district names may appear in source addresses. Maps links search the listed address; they are not verified entrance pins.'}</p>
    </div>
}
