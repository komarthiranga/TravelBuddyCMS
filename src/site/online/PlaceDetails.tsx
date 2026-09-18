'use client'

import { useEffect, useState } from 'react'
import { discovery } from './client'
import type { OnlinePlace } from './model'
import { PlaceActions, PlaceCard } from './PlaceCard'

export function PlaceDetails({ id }: { id: string }) {
    const [result, setResult] = useState<{ key: string; place?: OnlinePlace; error?: string } | null>(null)
    const [retry, setRetry] = useState(0)
    const key = `${id}:${retry}`
    const place = result?.key === key ? result.place : null
    const error = result?.key === key ? result.error : ''
    useEffect(() => {
        const controller = new AbortController()
        discovery<{ place: OnlinePlace }>({ action: 'details', id }, controller.signal).then(data => { if (!controller.signal.aborted) setResult({ key, place: data.place }) }).catch(cause => { if (!controller.signal.aborted) setResult({ key, error: cause.message }) })
        return () => controller.abort()
    }, [id, retry, key])
    if (error) return <div className="rounded-2xl border border-hairline bg-white p-5"><p role="alert">{error}</p><button className="my-3 min-h-11 underline" onClick={() => setRetry(n => n + 1)}>Retry details</button><PlaceActions id={id} /></div>
    if (!place) return <p role="status" className="rounded-2xl bg-white p-5">Loading place details…</p>
    return <PlaceCard key={id} place={place} detailed />
}
