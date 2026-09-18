'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { SessionProvider, useSession, signIn } from 'next-auth/react'
import type { Session } from 'next-auth'
import { discovery } from './client'
import { validPlaceId, type City, type UserPlace, type Position } from './model'

type State = {
    position: Position | null; locating: boolean; locationError: string; requestLocation: () => void
    pickerOpen: boolean; setPickerOpen: (open: boolean) => void
    city: City | null; chooseCity: (city: City) => void; cityError: string
    places: UserPlace[]; userError: string; loaded: boolean; refresh: () => Promise<void>
    update: (id: string, field: 'saved' | 'liked', value: boolean) => Promise<void>
}
const Context = createContext<State | null>(null)
export const useOnline = () => { const value = useContext(Context); if (!value) throw new Error('Missing discovery context'); return value }
function Content({ children }: { children: ReactNode }) {
    const { data: session } = useSession()
    const [city, setCity] = useState<City | null>(null)
    const [cityError, setCityError] = useState('')
    const [position, setPosition] = useState<Position | null>(null)
    const [locating, setLocating] = useState(false)
    const [locationError, setLocationError] = useState('')
    const [pickerOpen, setPickerOpen] = useState(false)
    const locationVersion = useRef(0)
    const userId = session?.user?.id
    const [collection, setCollection] = useState<{ owner: string; places: UserPlace[]; error?: string } | null>(null)
    const places = collection?.owner === userId ? collection?.places ?? [] : []
    const userError = collection?.owner === userId ? collection?.error ?? '' : ''
    const loaded = !userId || collection?.owner === userId
    const restoring = useRef<AbortController | null>(null)
    const version = useRef(0)
    const restoreCity = useCallback(() => {
        const controller = new AbortController()
        restoring.current?.abort()
        restoring.current = controller
        let id: string | null = null
        try { id = localStorage.getItem('tb:online-city-id') } catch { /* Browser storage is optional. */ }
        if (validPlaceId(id)) discovery<{ city: City }>({ action: 'city', id }, controller.signal).then(data => { if (!controller.signal.aborted) setCity(data.city) }).catch(cause => { if (!controller.signal.aborted) setCityError(cause.message) })
    }, [])
    const requestLocation = useCallback(() => {
        restoring.current?.abort()
        const request = ++locationVersion.current
        setLocationError('')
        if (!navigator.geolocation) { setLocationError('This browser cannot find your location. Choose a city instead.'); restoreCity(); return }
        setLocating(true)
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            if (request !== locationVersion.current) return
            setPosition({ latitude: coords.latitude, longitude: coords.longitude })
            setCity(null); setCityError(''); setLocating(false); setPickerOpen(false)
        }, error => {
            if (request !== locationVersion.current) return
            setLocating(false)
            setLocationError(error.code === 1 ? 'Location access is off. You can enable it in your browser settings, or choose a city.' : error.code === 3 ? 'Finding your location took too long. Try again or choose a city.' : 'We couldn’t find your location. Try again or choose a city.')
            restoreCity()
        }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 })
    }, [restoreCity])
    const cancelLocation = useCallback(() => { locationVersion.current++; restoring.current?.abort() }, [])
    useEffect(() => {
        let active = true
        let stopListening: (() => void) | undefined
        try { localStorage.removeItem('tb:last-known-location') } catch { /* Retire the old location cache. */ }
        // Never surprise a new visitor with a permission prompt. Existing grants auto-load nearby places.
        if (navigator.permissions) navigator.permissions.query({ name: 'geolocation' }).then(permission => {
            if (!active) return
            const changed = () => {
                if (permission.state === 'denied') {
                    cancelLocation(); setPosition(null); setLocating(false)
                    setLocationError('Location access is off. Choose a city to keep exploring.')
                    restoreCity()
                }
            }
            permission.addEventListener?.('change', changed)
            stopListening = () => permission.removeEventListener?.('change', changed)
            if (permission.state === 'granted') requestLocation()
            else restoreCity()
        }).catch(() => { if (active) restoreCity() })
        else Promise.resolve().then(() => { if (active) restoreCity() })
        return () => { active = false; stopListening?.(); cancelLocation() }
    }, [restoreCity, requestLocation, cancelLocation])
    const chooseCity = useCallback((value: City) => {
        locationVersion.current++
        restoring.current?.abort()
        setCity(value); setCityError(''); setPosition(null); setLocating(false); setLocationError('')
        try { localStorage.setItem('tb:online-city-id', value.id) } catch { /* City remains usable in memory. */ }
    }, [])
    const refresh = useCallback(async (signal?: AbortSignal) => {
        if (!userId) return
        const serial = ++version.current
        try {
            const response = await fetch('/api/user-places', { cache: 'no-store', signal })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error)
            if (!signal?.aborted && serial === version.current) setCollection({ owner: userId, places: data.places })
        } catch (cause) { if (!signal?.aborted && serial === version.current) setCollection({ owner: userId, places: [], error: cause instanceof Error ? cause.message : 'Saved places are unavailable.' }) }
    }, [userId])
    useEffect(() => {
        if (!userId) return
        const controller = new AbortController()
        const serial = ++version.current
        fetch('/api/user-places', { cache: 'no-store', signal: controller.signal })
            .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data })
            .then(data => { if (!controller.signal.aborted && serial === version.current) setCollection({ owner: userId, places: data.places }) })
            .catch(cause => { if (!controller.signal.aborted && serial === version.current) setCollection({ owner: userId, places: [], error: cause.message }) })
        return () => controller.abort()
    }, [userId])
    async function update(id: string, field: 'saved' | 'liked', value: boolean) {
        if (!userId) { await signIn('google'); return }
        const response = await fetch('/api/user-places', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ placeId: id, field, value }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        await refresh()
    }
    return <Context value={{ position, locating, locationError, requestLocation, pickerOpen, setPickerOpen, city, chooseCity, cityError, places, userError, loaded, refresh, update }}>{children}</Context>
}
export function OnlineProvider({ children, session }: { children: ReactNode; session: Session | null }) {
    return <SessionProvider session={session}><Content>{children}</Content></SessionProvider>
}
