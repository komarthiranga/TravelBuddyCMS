'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useId, useState, type FormEvent } from 'react'
import { Search, MapPin, ArrowRight } from 'lucide-react'
import { useChrome } from './locale-provider'
import type { JourneyPlace } from '@/site/api/getPlacesForJourney'

export type HeroPlace = Pick<JourneyPlace, 'id' | 'short_name' | 'slug' | 'category_id' | 'category_name' | 'short_description' | 'primary_image' | 'primary_image_alt'>

export function HomeHero({cityName, places}: {cityName: string; places: HeroPlace[]}) {
    const eluru = cityName.trim().toLowerCase() === 'eluru'
    const buddhaPark = eluru ? places.find(place => place.slug === 'eluru-buddha-park') : undefined
    const buddhaPhoto = buddhaPark?.primary_image?.startsWith('https://res.cloudinary.com/') ? buddhaPark.primary_image : undefined
    const router = useRouter()
    const listId = useId()
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)
    const {locale} = useChrome()
    const te = locale === 'te'
    const categories = Array.from(new Map(places.map(place => [place.category_id, {id: place.category_id, name: place.category_name}])).values())
    const term = query.trim().toLocaleLowerCase()
    const suggestions = [
        ...places.filter(p => `${p.short_name} ${p.category_name}`.toLocaleLowerCase().includes(term)).slice(0, 5).map(p => ({label: p.short_name, detail: p.category_name, href: `/attractions/${p.slug}`})),
        ...categories.filter(c => c.name.toLocaleLowerCase().includes(term)).slice(0, 3).map(c => ({label: c.name, detail: te ? 'ప్రదేశాల రకం' : 'Category', href: `/attractions?categoryId=${c.id}`})),
    ].slice(0, 7)
    function search(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (open && active >= 0 && suggestions[active]) { router.push(suggestions[active].href); setOpen(false); return }
        setOpen(false)
        const value = String(new FormData(event.currentTarget).get('search') ?? '').trim()
        router.push(value ? `/attractions?search=${encodeURIComponent(value)}` : '/attractions')
    }
    return <section lang={locale} className="bg-[#f5f7f2]">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
            <div className={`grid items-center gap-6 ${eluru ? 'md:grid-cols-2 md:gap-12' : ''}`}>
                <div>
                    <p className="text-sm font-semibold text-teal-brand-dark">{te ? 'మీ స్థానిక ప్రయాణ సహాయకుడు' : 'A little local help. A lovely day out.'}</p>
                    <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{te ? `${cityName}ని కలిసి చూద్దాం.` : `Let’s get to know ${cityName}.`}</h1>
                    <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft">{te ? 'చూడదగిన ప్రదేశాలు, భోజనం, అక్కడికి వెళ్లే దారి — మీతో పాటు మీ స్థానిక బడ్డీ.' : 'Find a place you’ll enjoy, a bite to eat, and your way there. Your local Buddy will help you start.'}</p>
                    <a href="#start-here" className="buddy-primary mt-5 inline-flex min-h-12 items-center gap-3 rounded-xl px-5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand">{te ? 'నగరాన్ని చూద్దాం' : 'Show me around'}<ArrowRight className="size-4" aria-hidden="true" /></a>
                </div>
                {eluru && <figure className="relative overflow-hidden rounded-2xl bg-teal-wash">
                    <div className="relative h-44 sm:h-64 md:h-80">
                        <Image src={buddhaPhoto ?? '/images/cities/eluru-buddha-park.webp'} alt={buddhaPhoto ? (buddhaPark?.primary_image_alt ?? 'Buddha Park in Eluru') : 'Buddha Park in Eluru, with its statue, footbridge and lake'} fill preload sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" style={{objectPosition: buddhaPhoto ? '50% 18%' : '42% center'}} />
                    </div>
                    <figcaption className="flex flex-wrap items-center gap-2 bg-white px-4 py-3 text-xs text-ink-soft"><MapPin className="size-3.5 shrink-0" aria-hidden="true" />{te ? 'బుద్ధ పార్క్, ఏలూరు' : 'A glimpse of Eluru · Buddha Park'}
                        {!buddhaPhoto && <span>Photo: <a className="underline" href="https://commons.wikimedia.org/wiki/File:Panorama_of_Buddha_Park,_Eluru.jpg">IM3847 · 2017</a> · <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> · cropped &amp; resized</span>}
                    </figcaption>
                </figure>}
            </div>
            <form onSubmit={search} role="search" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1) } }} className="relative mt-6 flex items-center gap-3 rounded-xl border border-ink/15 bg-white p-2 focus-within:ring-2 focus-within:ring-teal-brand sm:p-3">
                <div className="hidden items-center gap-2 border-r border-hairline px-4 sm:flex"><MapPin className="size-5 text-teal-brand-dark" aria-hidden="true"/><span className="text-sm"><span className="block font-semibold">{te ? 'నగరం' : 'Exploring'}</span><span lang="en" className="text-ink-soft">{cityName}</span></span></div>
                <label className="min-w-0 flex-1 pl-2"><span className="block text-xs font-semibold text-ink">{te ? 'ఏం చూడాలనుంది?' : 'Already have a place in mind?'}</span><input name="search" type="search" role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={open} aria-controls={open ? listId : undefined} aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined} value={query} onChange={event => { setQuery(event.target.value); setOpen(true); setActive(-1) }} onFocus={() => setOpen(true)} onKeyDown={event => {
                    if (event.nativeEvent.isComposing) return
                    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setActive(-1) }
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault(); setOpen(true)
                        setActive(index => suggestions.length ? (index < 0 ? (event.key === 'ArrowDown' ? 0 : suggestions.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : suggestions.length - 1)) % suggestions.length) : -1)
                    }
                }} placeholder={te ? 'ప్రదేశం పేరు వెతకండి' : 'Search a place'} className="min-h-9 w-full min-w-0 bg-transparent text-base text-ink outline-none" /></label>
                <button type="submit" className="buddy-primary inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-4 font-semibold sm:rounded-full"><Search className="size-5" aria-hidden="true"/><span className="sr-only sm:not-sr-only">{te ? 'వెతకండి' : 'Search'}</span></button>
                {open && <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-hairline bg-white p-2 shadow-xl">
                    <p className="px-3 py-2 text-xs font-semibold text-ink-soft">{te ? 'మీ నగరంలో వెతకండి' : `Explore ${cityName}`}</p>
                    <ul id={listId} role="listbox" aria-label={te ? 'సూచనలు' : 'Suggested places and categories'} className="max-h-72 overflow-y-auto">
                        {suggestions.map((item, index) => <li key={item.href} id={`${listId}-${index}`} role="option" aria-selected={active === index} onMouseDown={event => event.preventDefault()} onClick={() => { router.push(item.href); setOpen(false) }} className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 ${active === index ? 'bg-teal-wash' : 'hover:bg-teal-wash'}`}>
                            <span className="font-medium text-ink">{item.label}</span><span className="text-xs text-ink-soft">{item.detail}</span>
                        </li>)}
                    </ul>
                    {!suggestions.length && <p role="status" className="px-3 py-4 text-sm text-ink-soft">{te ? 'సూచనలు లేవు. మరో పేరు ప్రయత్నించండి.' : 'No suggestions yet. Try another place name, or press Search.'}</p>}
                    <span className="sr-only" role="status">{suggestions.length} suggestions available</span>
                </div>}
            </form>
        </div>
    </section>
}
