'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useId, useState, type FormEvent } from 'react'
import { Search, MapPin, Compass, ArrowRight } from 'lucide-react'
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
    return <section lang={locale} className="relative border-b border-hairline bg-white">
        <div className="relative isolate">
            {eluru && <div className="absolute inset-0 -z-10 overflow-hidden bg-ink">
                <Image src={buddhaPhoto ?? "/images/cities/eluru-buddha-park.webp"} alt={buddhaPhoto ? (buddhaPark?.primary_image_alt ?? "Buddha Park in Eluru") : "Buddha Park in Eluru, with its statue, footbridge and lake"} fill preload sizes="100vw" className="object-cover" style={{ objectPosition: buddhaPhoto ? '50% 20%' : '42% center' }} />
                <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
            </div>}
        <div className={`mx-auto max-w-6xl px-5 sm:px-8 ${eluru ? 'pb-7 pt-12 sm:pb-8 sm:pt-16' : 'pb-5 pt-7 sm:pt-10'}`}>
            <div className="text-center">
                <p className={`text-sm font-semibold ${eluru ? 'text-white' : 'text-teal-brand-dark'}`}>{te ? 'మీ నగరం. మీ ప్రయాణం.' : 'Your city. Your kind of day.'}</p>
                <h1 className={`mt-3 text-3xl font-semibold tracking-tight sm:text-5xl ${eluru ? 'text-white' : 'text-ink'}`}>{te ? `${cityName}లో ఏం చూద్దాం?` : `Where will ${cityName} take you?`}</h1>
                <p className={`mx-auto mt-4 max-w-xl text-base leading-relaxed ${eluru ? 'text-white' : 'text-ink-soft'}`}>{te ? 'చూడదగిన ప్రదేశాలు, ఉపయోగకరమైన వివరాలు — మీ బడ్డీతో.' : 'Find places to explore, with a little help from your local Buddy.'}</p>
            </div>
            <form onSubmit={search} role="search" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1) } }} className="relative mx-auto mt-6 flex max-w-2xl items-center gap-3 rounded-2xl border border-ink/20 bg-white p-2 shadow-card focus-within:ring-2 focus-within:ring-teal-brand sm:rounded-full sm:p-3">
                <div className="hidden items-center gap-2 border-r border-hairline px-4 sm:flex"><MapPin className="size-5 text-teal-brand-dark" aria-hidden="true"/><span className="text-sm"><span className="block font-semibold">{te ? 'నగరం' : 'Exploring'}</span><span lang="en" className="text-ink-soft">{cityName}</span></span></div>
                <label className="min-w-0 flex-1 pl-2"><span className="block text-xs font-semibold text-ink">{te ? 'ఏం చూడాలనుంది?' : 'What would you like to discover?'}</span><input name="search" type="search" role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined} value={query} onChange={event => { setQuery(event.target.value); setOpen(true); setActive(-1) }} onFocus={() => setOpen(true)} onKeyDown={event => {
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
            {eluru && <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-white">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2"><MapPin className="size-3.5" aria-hidden="true" />{te ? 'బుద్ధ పార్క్, ఏలూరు' : 'Buddha Park, Eluru'}</span>
                {!buddhaPhoto && <span className="rounded bg-black/40 px-2 py-1">Photo: <a className="underline underline-offset-2" href="https://commons.wikimedia.org/wiki/File:Panorama_of_Buddha_Park,_Eluru.jpg">IM3847 · 2017</a> · <a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> · cropped &amp; resized</span>}
            </div>}
        </div>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-4 sm:px-8">
            <nav aria-label={te ? 'ప్రదేశాల రకాలు' : 'Explore by category'} className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
                <Link href="/attractions" className="inline-flex min-h-12 items-center gap-2 border-b-2 border-ink text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-teal-brand"><Compass className="size-4" aria-hidden="true"/>{te ? 'అన్ని ప్రదేశాలు' : 'All places'}</Link>
                {categories.map(category => <Link key={category.id} href={`/attractions?categoryId=${category.id}`} lang="en" className="inline-flex min-h-12 items-center border-b-2 border-transparent text-sm font-medium text-ink-soft hover:border-ink/30 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-brand">{category.name}</Link>)}
                <Link href="/attractions?free=1" className="inline-flex min-h-12 items-center gap-1 text-sm font-semibold text-teal-brand-dark focus-visible:outline-2 focus-visible:outline-teal-brand">{te ? 'ఉచిత ప్రవేశం' : 'Free entry'}<ArrowRight className="size-4" aria-hidden="true"/></Link>
            </nav>
        </div>
    </section>
}
