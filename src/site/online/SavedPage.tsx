'use client'

import { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useOnline } from './OnlineProvider'
import { PlaceDetails } from './PlaceDetails'

export function SavedPage() {
    const { data: session, status } = useSession()
    const { places, userError, loaded, refresh } = useOnline()
    const [filter, setFilter] = useState<'saved' | 'liked'>('saved')
    const [page, setPage] = useState(0)
    const [deleting, setDeleting] = useState(false)
    const [confirmation, setConfirmation] = useState('')
    const [deleteError, setDeleteError] = useState('')
    async function deleteAccount() {
        setDeleting(true); setDeleteError('')
        try {
            const response = await fetch('/api/user-places', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmation }) })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error)
            await signOut({ redirectTo: '/' })
        } catch (cause) { setDeleteError(cause instanceof Error ? cause.message : 'Please retry.'); setDeleting(false) }
    }
    const filtered = places.filter(p => p[filter])
    const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 4) - 1))
    return <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><h1 className="font-display text-4xl">Your little collection</h1><p className="mt-3 text-ink-soft">Places you saved and liked, ready for your next trip.</p>
        {status === 'loading' ? <p role="status" className="mt-6">Loading your account…</p> : !session?.user ? <div className="mt-6 rounded-3xl border border-hairline bg-white p-6"><p>Sign in to save places and access them across your devices.</p><button className="mt-4 min-h-12 rounded-full bg-ink px-5 text-white" onClick={() => void signIn('google')}>Sign in with Google</button></div> : <>
            <div className="mt-6 flex gap-3">{(['saved', 'liked'] as const).map(t => <button key={t} aria-pressed={filter === t} onClick={() => { setFilter(t); setPage(0) }} className={`min-h-11 rounded-full border px-5 capitalize ${filter === t ? 'bg-ink text-white' : 'bg-white'}`}>{t} ({places.filter(p => p[t]).length})</button>)}</div>
            {userError ? <div role="alert" className="mt-5"><p>{userError}</p><button className="min-h-11 underline" onClick={() => void refresh()}>Retry</button></div> : !loaded ? <p role="status" className="mt-5">Loading your places…</p> : <>
                {!filtered.length && <p className="mt-6">No {filter} places yet. Explore a city and tap {filter === 'saved' ? 'Save' : 'Like'}.</p>}
                <div className="mt-6 grid items-start gap-5 md:grid-cols-2">{filtered.slice(currentPage * 4, currentPage * 4 + 4).map(p => <PlaceDetails key={p.place_id} id={p.place_id} />)}</div>
                {filtered.length > 4 && <div className="mt-6 flex items-center gap-4"><button disabled={!currentPage} onClick={() => setPage(currentPage - 1)} className="min-h-11 rounded-xl border px-4 disabled:opacity-40">Previous</button><span>Page {currentPage + 1}</span><button disabled={(currentPage + 1) * 4 >= filtered.length} onClick={() => setPage(currentPage + 1)} className="min-h-11 rounded-xl border px-4 disabled:opacity-40">Next</button></div>}
            </>}
            <details className="mt-12 rounded-2xl border border-hairline bg-white p-5"><summary className="cursor-pointer text-sm font-semibold">Account & privacy</summary><p className="mt-3 text-sm">Permanently delete your TravelBuddy profile and all saved and liked places. This cannot be undone. Your Google account will not be deleted.</p><form className="mt-4 flex flex-wrap gap-3" onSubmit={event => { event.preventDefault(); void deleteAccount() }}><label className="text-sm">Type DELETE to confirm<input value={confirmation} onChange={event => setConfirmation(event.target.value)} className="mt-2 block min-h-11 rounded-xl border px-3" autoComplete="off" /></label><button disabled={deleting || confirmation !== 'DELETE'} className="self-end rounded-xl bg-red-800 px-4 py-3 text-sm text-white disabled:opacity-40">{deleting ? 'Deleting…' : 'Permanently delete my account'}</button></form>{deleteError && <p role="alert" className="mt-2 text-sm text-red-800">{deleteError}</p>}</details>
        </>}
    </div>
}
