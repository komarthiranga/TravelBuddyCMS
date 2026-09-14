'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChrome } from './locale-provider'
import { Search, Check } from 'lucide-react'

export type FilterChip = {
    href: string
    label: string
    active: boolean
}

export function AttractionFilters({
    search,
    chips,
    hiddenFields,
    suggestions,
}: {
    suggestions: { id: number; name: string; category: string }[]
    search?: string
    chips: FilterChip[]
    buildSearchHref: string
    hiddenFields?: Record<string, string>
}) {
    const { locale } = useChrome()
    const te = locale === 'te'
    const router = useRouter()
    const listId = useId()
    const [value, setValue] = useState(search ?? '')
    const [expanded, setExpanded] = useState(false)
    const [active, setActive] = useState(-1)
    const matches = suggestions.filter(item => item.name.toLocaleLowerCase().includes(value.trim().toLocaleLowerCase())).slice(0, 8)
    function choose(name: string) {
        setValue(name); setExpanded(false); setActive(-1)
        const params = new URLSearchParams(hiddenFields)
        params.set('search', name)
        router.push(`/attractions?${params}`)
    }
    return (
        <div lang={locale} className="mt-5">
            <form
                action="/attractions"
                method="GET"
                role="search"
                onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setExpanded(false); setActive(-1) } }}
                onSubmit={event => {
                    if (expanded && active >= 0 && matches[active]) { event.preventDefault(); choose(matches[active].name) }
                    setExpanded(false)
                }}
                className="relative flex min-h-12 items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 focus-within:ring-2 focus-within:ring-teal-brand"
            >
                {hiddenFields &&
                    Object.entries(hiddenFields).map(([name, value]) => (
                        <input key={name} type="hidden" name={name} value={value} />
                    ))}
                <Search className="size-5 shrink-0 text-ink-soft" aria-hidden="true" />
                <label htmlFor="attractions-search" className="sr-only">
                    {te ? 'ప్రదేశాలను వెతకండి' : 'Search places'}
                </label>
                <input
                    id="attractions-search"
                    type="search"
                    name="search"
                    value={value}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={expanded}
                    aria-controls={expanded ? listId : undefined}
                    aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
                    onFocus={() => setExpanded(true)}
                    onChange={event => { setValue(event.target.value); setExpanded(true); setActive(-1) }}
                    onKeyDown={event => {
                        if (event.nativeEvent.isComposing) return
                        if (event.key === 'Escape') { event.preventDefault(); setExpanded(false); setActive(-1) }
                        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                            event.preventDefault(); setExpanded(true)
                            const down = event.key === 'ArrowDown'
                            setActive(index => !matches.length ? -1 : index < 0 ? (down ? 0 : matches.length - 1) : (index + (down ? 1 : matches.length - 1)) % matches.length)
                        }
                    }}
                    placeholder={te ? 'ప్రదేశాలను వెతకండి' : 'Search places'}
                    className="min-h-12 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-soft/70 focus:outline-none"
                />
                <button
                    type="submit"
                    className="inline-flex min-h-11 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-white outline-none hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand"
                >
                    {te ? 'వెతకండి' : 'Search'}
                </button>
                {expanded && <div className="absolute inset-x-0 top-full z-40 mt-2 rounded-xl border border-hairline bg-white p-2 shadow-xl">
                    <p className="px-3 py-2 text-xs font-semibold text-ink-soft">{te ? 'ఈ ఫిల్టర్లలో ప్రదేశాలు' : 'Places matching your filters'}</p>
                    <ul id={listId} role="listbox" aria-label={te ? 'ప్రదేశాల సూచనలు' : 'Place suggestions'} className="max-h-72 overflow-y-auto">
                        {matches.map((item, index) => <li key={item.id} id={`${listId}-${index}`} role="option" aria-selected={index === active}
                            onMouseDown={event => event.preventDefault()} onClick={() => choose(item.name)}
                            className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ${index === active ? 'bg-teal-wash' : 'hover:bg-teal-wash'}`}>
                            <span className="font-medium text-ink">{item.name}</span><span className="text-xs text-ink-soft">{item.category}</span>
                        </li>)}
                    </ul>
                    {!matches.length && <p className="px-3 py-3 text-sm text-ink-soft">{te ? 'మరో పేరు ప్రయత్నించండి లేదా ఫిల్టర్లను తొలగించండి.' : 'No matching names. Try another name or remove a filter.'}</p>}
                    <span className="sr-only" role="status">{matches.length} suggestions available</span>
                </div>}
            </form>

            <p className="mt-4 text-sm font-semibold text-ink-soft">{te ? 'ప్రదేశం రకం' : 'Type of place'}</p>
            <div className="mt-2 flex flex-wrap gap-2">
                {chips.filter(chip => chip.label !== 'Free entry' && chip.label !== 'Open now').map((chip) => (
                    <Chip key={chip.href + chip.label} chip={chip} />
                ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={te ? 'మరిన్ని ఫిల్టర్లు' : 'Additional filters'}>
                {chips.filter(chip => chip.label === 'Free entry' || chip.label === 'Open now').map(chip => <Chip key={chip.label} chip={chip} />)}
            </div>

        </div>
    )
}

function Chip({ chip }: { chip: FilterChip }) {
    const { locale } = useChrome()
    const labels: Record<string, string> = { All: 'అన్నీ', 'Free entry': 'ఉచిత ప్రవేశం', 'Open now': 'ఇప్పుడు తెరిచి ఉన్నవి' }
    return (
        <Link
            href={chip.href}
            aria-current={chip.active ? 'true' : undefined}
            className={`inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
                chip.active
                    ? 'buddy-selected'
                    : 'border border-ink/15 bg-white text-ink hover:bg-cream'
            }`}
        >
            {chip.active && <Check className="size-4" aria-hidden="true" />}
            {locale === 'te' ? labels[chip.label] ?? chip.label : chip.label}
        </Link>
    )
}
