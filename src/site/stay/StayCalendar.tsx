'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AccessibleDialog } from '@/site/components/AccessibleDialog'
import { addDays, stayNights } from './search'
import styles from './stay-search.module.css'

type Range = { checkin: string; checkout: string }
export const displayDate = (date: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
function shiftMonth(month: string, offset: number) {
    const date = new Date(`${month}T00:00:00Z`)
    date.setUTCMonth(date.getUTCMonth() + offset)
    return date.toISOString().slice(0, 10)
}

export function StayCalendar({ value, today, initialField, onApply, onClose }: {
    value: Range; today: string; initialField: keyof Range; onApply: (range: Range) => void; onClose: () => void
}) {
    const [range, setRange] = useState(value)
    const [field, setField] = useState(initialField)
    const [month, setMonth] = useState(`${value[initialField].slice(0, 7)}-01`)
    const [focused, setFocused] = useState(value[initialField])
    const grid = useRef<HTMLDivElement>(null)
    const min = field === 'checkin' ? today : addDays(range.checkin, 1)
    const max = field === 'checkin' ? addDays(today, 365) : addDays(range.checkin, 30)
    const first = new Date(`${month}T00:00:00Z`)
    const start = addDays(month, -first.getUTCDay())
    const days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
    const activeDay = days.includes(focused) && focused >= min && focused <= max ? focused : days.find(d => d.slice(0, 7) === month.slice(0, 7) && d >= min && d <= max)
    function select(date: string) {
        if (field === 'checkin') {
            setRange({ checkin: date, checkout: range.checkout > date && range.checkout <= addDays(date, 30) ? range.checkout : addDays(date, 1) })
            setField('checkout')
        } else setRange(old => ({ ...old, checkout: date }))
        setFocused(date)
    }
    function keyboard(event: KeyboardEvent<HTMLButtonElement>, date: string) {
        const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -new Date(`${date}T00:00:00Z`).getUTCDay(), End: 6 - new Date(`${date}T00:00:00Z`).getUTCDay() }
        if (!(event.key in offsets)) return
        event.preventDefault()
        const next = addDays(date, offsets[event.key])
        if (next < min || next > max) return
        setFocused(next)
        setMonth(`${next.slice(0, 7)}-01`)
        requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus())
    }
    return <AccessibleDialog label="Choose stay dates" onClose={onClose}><div className={styles.calendar}>
        <p className={styles.fieldLabel}>MAKE YOURSELF AT HOME</p><h2>When are you staying?</h2>
        <div className={styles.rangeFields}>{(['checkin', 'checkout'] as const).map(key => <button type="button" key={key} aria-pressed={field === key} onClick={() => { setField(key); setMonth(`${range[key].slice(0, 7)}-01`); setFocused(range[key]) }}><span>{key === 'checkin' ? 'Check-in' : 'Check-out'}</span><strong>{displayDate(range[key])}</strong></button>)}</div>
        <p role="status" className={styles.calendarHint}>Choose your {field === 'checkin' ? 'arrival' : 'departure'} date{field === 'checkout' ? ' · up to 30 nights' : ''}.</p>
        <div className={styles.monthHeading}><button type="button" aria-label="Previous month" disabled={month.slice(0, 7) <= min.slice(0, 7)} onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft size={20} /></button><h3 aria-live="polite">{new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first)}</h3><button type="button" aria-label="Next month" disabled={month.slice(0, 7) >= max.slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight size={20} /></button></div>
        <div className={styles.calendarGrid} ref={grid} role="group" aria-label="Calendar dates"><div className={styles.weekdays}>{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day}>{day}</span>)}</div>{days.map(date => date.slice(0, 7) !== month.slice(0, 7) ? <span key={date} /> : <button type="button" key={date} data-date={date} tabIndex={date === activeDay ? 0 : -1} disabled={date < min || date > max} aria-label={displayDate(date)} aria-current={date === today ? 'date' : undefined} aria-pressed={date === range.checkin || date === range.checkout} className={date > range.checkin && date < range.checkout ? styles.inRange : ''} onKeyDown={event => keyboard(event, date)} onClick={() => select(date)}>{Number(date.slice(-2))}</button>)}</div>
        <p className={styles.calendarHint}>{stayNights(range)} {stayNights(range) === 1 ? 'night' : 'nights'} · Highlighted dates are your stay.</p>
        <button type="button" className={styles.doneButton} onClick={() => onApply(range)}>Apply dates · {stayNights(range)} {stayNights(range) === 1 ? 'night' : 'nights'}</button>
    </div></AccessibleDialog>
}
