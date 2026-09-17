'use client'

import Form from 'next/form'
import { usePathname } from 'next/navigation'
import { useId, useState, type FormEvent } from 'react'
import { BedDouble, CalendarDays, Check, ChevronDown, MapPin, Minus, Plus, Search, Users } from 'lucide-react'
import { AccessibleDialog } from '@/site/components/AccessibleDialog'
import { addDays, searchError, searchSummary, stayNights, todayInIndia, validDate, type StaySearch } from './search'
import styles from './stay-search.module.css'
import { StayCalendar, displayDate } from './StayCalendar'

function Counter({ label, hint, value, min, max, onChange }: {
    label: string; hint: string; value: number; min: number; max: number; onChange: (value: number) => void
}) {
    return <div className={styles.counterRow}>
        <div><strong>{label}</strong><p>{hint}</p></div>
        <div className={styles.counter}>
            <button type="button" aria-label={`Remove one ${label.toLowerCase() === 'adults' ? 'adult' : 'room'}`} disabled={value <= min} onClick={() => onChange(value - 1)}><Minus size={16} /></button>
            <output aria-label={`${label} count`} aria-live="polite">{value}</output>
            <button type="button" aria-label={`Add one ${label.toLowerCase() === 'adults' ? 'adult' : 'room'}`} disabled={value >= max} onClick={() => onChange(value + 1)}><Plus size={16} /></button>
        </div>
    </div>
}

export function StaySearchForm({ search, today, cityName }: { search: StaySearch; today: string; cityName: string }) {
    const path = usePathname()
    const id = useId()
    const [draft, setDraft] = useState(search)
    const [error, setError] = useState<string | null>(null)
    const [calendarField, setCalendarField] = useState<'checkin' | 'checkout' | null>(null)
    const [guestsOpen, setGuestsOpen] = useState(false)
    const [guestDraft, setGuestDraft] = useState({ guests: search.guests, rooms: search.rooms })
    function submit(event: FormEvent<HTMLFormElement>) {
        const message = searchError(draft, todayInIndia())
        setError(message)
        if (message) event.preventDefault()
    }
    function quickDate(offset: number) {
        const checkin = addDays(todayInIndia(), offset)
        setDraft(old => ({ ...old, checkin, checkout: addDays(checkin, 1) }))
        setError(null)
    }
    const weekday = (date: string) => validDate(date) ? new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)) : 'Choose a date'
    const nights = validDate(draft.checkin) && validDate(draft.checkout) ? stayNights(draft) : 0
    const changed = JSON.stringify(draft) !== JSON.stringify(search)
    return <section aria-label="Stay dates and guests" className={styles.panel}>
        <div className={styles.heading}><h3><BedDouble size={20} />Find your stay</h3><span>PER PERSON / NIGHT</span></div>
        <Form action={path} scroll={false} onSubmit={submit} aria-describedby={`${id}-summary ${id}-notice`}>
            <input type="hidden" name="guests" value={draft.guests} /><input type="hidden" name="rooms" value={draft.rooms} />
            <div className={styles.searchBar}>
                <div className={styles.destination}><span className={styles.fieldLabel}><MapPin size={14} />DESTINATION</span><strong>{cityName}</strong><span>Change city using the header</span></div>
                {(['checkin', 'checkout'] as const).map(field => <div key={field} className={styles.dateWrapper}><input type="hidden" name={field} value={draft[field]} /><button type="button" className={styles.dateField} aria-label={field === 'checkin' ? 'Choose check-in date' : 'Choose check-out date'} aria-haspopup="dialog" aria-expanded={calendarField === field} onClick={() => setCalendarField(field)}><span className={styles.fieldLabel}><CalendarDays size={14} />{field === 'checkin' ? 'CHECK-IN' : 'CHECK-OUT'}</span><strong>{displayDate(draft[field])}</strong><span>{weekday(draft[field])}{field === 'checkout' && nights > 0 ? ` · ${nights} ${nights === 1 ? 'night' : 'nights'}` : ''}</span></button></div>)}
                <button type="button" className={styles.guestField} aria-label="Choose rooms and guests" aria-haspopup="dialog" aria-expanded={guestsOpen} onClick={() => { setGuestDraft({ guests: draft.guests, rooms: draft.rooms }); setGuestsOpen(true) }}><span className={styles.fieldLabel}><Users size={14} />ROOMS & GUESTS<ChevronDown size={14} /></span><strong>{draft.guests} {draft.guests === 1 ? 'adult' : 'adults'}</strong><span>{draft.rooms} {draft.rooms === 1 ? 'room' : 'rooms'} · Change</span></button>
                <button type="submit" className={styles.searchButton}><Search size={19} />Search stays</button>
            </div>
            <div className={styles.quickRow}><span>Need a room soon?</span>{[{ label: 'Tonight', offset: 0 }, { label: 'Tomorrow', offset: 1 }].map(({ label, offset }) => <button type="button" key={label} aria-pressed={draft.checkin === addDays(today, offset) && nights === 1} onClick={() => quickDate(offset)}>{draft.checkin === addDays(today, offset) && nights === 1 && <Check size={13} />}{label}</button>)}{changed && <span className={styles.unsaved}>Press Search stays to apply changes</span>}</div>
            {error && <p role="alert" className={styles.error}>{error}</p>}
        </Form>
        <p id={`${id}-summary`} role="status" className={styles.summary}>Selected: {searchSummary(search)}</p>
        <p id={`${id}-notice`} className={styles.notice}>Availability isn’t confirmed yet. Ask the hotel for a quote for your selected dates and guests.</p>
        <details className={styles.explanation}><summary>How per-person prices work</summary><p>The total quoted cost for all rooms is divided by nights and adults. It’s a shared cost, not an individual room rate. Any excluded fees will be shown separately. For children or stays over 30 nights, contact the hotel.</p></details>
        {calendarField && <StayCalendar value={draft} today={todayInIndia()} initialField={calendarField} onClose={() => setCalendarField(null)} onApply={range => { setDraft(old => ({ ...old, ...range })); setError(null); setCalendarField(null) }} />}
        {guestsOpen && <AccessibleDialog label="Rooms and guests" onClose={() => setGuestsOpen(false)}>
            <div className={styles.guestDialog}><span className={styles.dialogIcon}><Users size={24} /></span><h2>Who’s staying?</h2><p>Choose your rooms and the number of adults.</p>
                <Counter label="Adults" hint="Age 18 and above · up to 16" value={guestDraft.guests} min={1} max={16} onChange={guests => setGuestDraft(old => ({ guests, rooms: Math.min(old.rooms, guests) }))} />
                <Counter label="Rooms" hint="At least one adult per room" value={guestDraft.rooms} min={1} max={guestDraft.guests} onChange={rooms => setGuestDraft(old => ({ ...old, rooms }))} />
                <p className={styles.childrenNote}>Travelling with children? Confirm their ages and the room policy directly with the hotel.</p>
                <button type="button" className={styles.doneButton} onClick={() => { setDraft(old => ({ ...old, ...guestDraft })); setError(null); setGuestsOpen(false) }}>Done · {guestDraft.guests} {guestDraft.guests === 1 ? 'adult' : 'adults'}, {guestDraft.rooms} {guestDraft.rooms === 1 ? 'room' : 'rooms'}</button>
            </div>
        </AccessibleDialog>}
    </section>
}

export function StayPriceStatus({ search }: { search: StaySearch }) {
    return <div><strong className="block text-sm font-semibold">Price not available for these dates</strong><span className="mt-1 block text-xs leading-5 text-ink-soft">Per person / night · {search.guests} {search.guests === 1 ? 'adult' : 'adults'} · {search.rooms} {search.rooms === 1 ? 'room' : 'rooms'}</span><span className="mt-1 block text-xs leading-5 text-ink-soft">Ask the hotel for a total quote for your selected stay.</span></div>
}
