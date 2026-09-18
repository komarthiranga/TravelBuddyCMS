'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import { MapPin, Search, ArrowUpRight, LocateFixed, ChevronDown, Compass } from 'lucide-react'
import styles from './discovery.module.css'
import { AccessibleDialog } from '@/site/components/AccessibleDialog'
import { useOnline } from './OnlineProvider'
import { discovery } from './client'
import type { City } from './model'

export function OnlineHeader() {
    const router = useRouter()
    const path = usePathname()
    const openDiscovery = () => { if (!['/', '/attractions', '/food', '/hotels', '/transport', '/essentials', '/services', '/guide', '/online'].includes(path)) router.push('/') }
    const { city, chooseCity, cityError, position, locating, locationError, requestLocation, pickerOpen: open, setPickerOpen: setOpen } = useOnline()
    const { data: session } = useSession()
    const [query, setQuery] = useState('')
    const [cities, setCities] = useState<City[]>([])
    const [busy, setBusy] = useState(false)
    const [searched, setSearched] = useState(false)
    const [error, setError] = useState('')
    const token = useRef('')
    const pending = useRef<AbortController | null>(null)
    function close() { pending.current?.abort(); setOpen(false); setBusy(false) }
    async function search() {
        if (!token.current) token.current = crypto.randomUUID()
        pending.current?.abort()
        const controller = new AbortController(); pending.current = controller
        setBusy(true); setError(''); setCities([]); setSearched(false)
        try {
            const result = await discovery<{ cities: City[] }>({ action: 'cities', query, sessionToken: token.current }, controller.signal)
            if (!controller.signal.aborted) { setCities(result.cities); setSearched(true) }
        } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'City search is unavailable.') }
        finally { if (!controller.signal.aborted) setBusy(false) }
    }
    async function select(id: string) {
        pending.current?.abort()
        const controller = new AbortController(); pending.current = controller
        setBusy(true); setError('')
        try {
            const result = await discovery<{ city: City }>({ action: 'city', id, sessionToken: token.current }, controller.signal)
            if (!controller.signal.aborted) { chooseCity(result.city); close(); openDiscovery() }
        } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'City could not be selected.') }
        finally { if (!controller.signal.aborted) setBusy(false) }
    }
    return <header className={styles.header}>
        <nav aria-label="Main" className={styles.headerInner}>
            <Link href="/" aria-label="TravelBuddy home" className={styles.wordmark}><span className={styles.logoMark}><Compass size={23}/></span>travel<em>buddy.</em></Link>
            <div className={styles.headerLinks}><Link href="/">Discover</Link><Link href="/saved">My collection</Link></div>
            <button className={styles.destination} onClick={() => { token.current = crypto.randomUUID(); setError(''); setCities([]); setQuery(''); setSearched(false); setOpen(true) }} aria-haspopup="dialog" aria-expanded={open}>
                <MapPin size={15}/><strong>{position ? 'Around your location' : city?.name || 'Where are you headed?'}</strong><ChevronDown size={13}/>
            </button>
            {session?.user ? <button className={styles.account} onClick={() => void signOut()}>Sign out</button> : <button className={styles.account} onClick={() => void signIn('google')}>Sign in with Google</button>}
        </nav>
        {cityError && <p role="status" className="mx-auto max-w-6xl px-5 pb-3 text-sm text-amber-900">{cityError} Choose your city again to retry.</p>}
        {open && <AccessibleDialog label="Choose a city in India" onClose={close}>
            <p className={styles.eyebrow}>A little adventure starts here</p><h2 className="mt-3 font-display text-3xl">Where to, explorer?</h2>
            <button className={styles.dialogLocation} disabled={locating} onClick={() => { requestLocation(); openDiscovery() }}><LocateFixed size={23}/><span><strong>{locating ? 'Finding you…' : 'Use my current location'}</strong><small>Shared with Google Maps for nearby places. Never saved.</small></span><ArrowUpRight size={17} className="ml-auto"/></button>
            {locationError && <p role="alert" className={styles.notice}>{locationError}</p>}
            <div className={styles.divider}>OR PICK A CITY IN INDIA</div>
            <form onSubmit={event => { event.preventDefault(); void search() }} className="mt-5 flex gap-2">
                <label className="min-w-0 flex-1"><span className="sr-only">City name</span><input autoFocus required minLength={3} maxLength={100} value={query} onChange={event => { pending.current?.abort(); setBusy(false); setCities([]); setSearched(false); setQuery(event.target.value) }} placeholder="Try Eluru, Hyderabad, Jaipur…" className="min-h-12 w-full rounded-xl border border-ink/20 px-4" /></label>
                <button disabled={busy || query.trim().length < 3} className="flex min-h-12 items-center gap-2 rounded-xl bg-ink px-4 text-white disabled:opacity-50"><Search size={18} />Search</button>
            </form>
            <div aria-live="polite" aria-busy={busy} className="mt-4">{busy && <p>Finding your city…</p>}{error && <p role="alert" className="text-amber-900">{error}</p>}{searched && !cities.length && <p>No cities found. Try another spelling.</p>}</div>
            <ul className="mt-3 space-y-2">{cities.map(item => <li key={item.id}><button disabled={busy} onClick={() => void select(item.id)} className="w-full rounded-2xl border border-hairline p-4 text-left hover:bg-teal-wash disabled:opacity-50"><strong className="block">{item.name}</strong><span className="text-sm text-ink-soft">{item.address}</span></button></li>)}</ul>
            <p className="mt-5 text-sm font-medium text-ink-soft">Google Maps</p>
        </AccessibleDialog>}
    </header>
}
