'use client'

import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from 'react'

import type { Coords } from '@/site/lib/geo'

export type LocationStatus =
    | 'idle' // never asked
    | 'locating' // waiting on the browser
    | 'ready' // we have coordinates
    | 'denied' // user said no, or previously blocked
    | 'unavailable' // no geolocation support
    | 'error' // lookup failed (timeout, no signal)

type LocationState = {
    coords: Coords | null
    status: LocationStatus
    /** True once the cache has been read, so the UI can avoid flashing a prompt. */
    hydrated: boolean
}

const STORAGE_KEY = 'tb:last-known-location'
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

/**
 * Geolocation lives outside React, so it is modelled as an external store.
 * This keeps the server and first client render identical (no hydration
 * mismatch) without pushing browser state through setState in an effect.
 */
const SERVER_STATE: LocationState = { coords: null, status: 'idle', hydrated: false }

let state: LocationState = SERVER_STATE
const listeners = new Set<() => void>()

function setState(patch: Partial<LocationState>) {
    state = { ...state, ...patch }
    for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

const getSnapshot = () => state
const getServerSnapshot = () => SERVER_STATE

type CachedLocation = { lat: number; lng: number; at: number }

function readCache(): Coords | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as CachedLocation
        if (
            typeof parsed?.lat !== 'number' ||
            typeof parsed?.lng !== 'number' ||
            typeof parsed?.at !== 'number' ||
            Date.now() - parsed.at > CACHE_TTL_MS
        ) {
            window.localStorage.removeItem(STORAGE_KEY)
            return null
        }
        return { lat: parsed.lat, lng: parsed.lng }
    } catch {
        return null
    }
}

function writeCache(coords: Coords) {
    try {
        const payload: CachedLocation = { ...coords, at: Date.now() }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
        // Private browsing or a full quota — the feature still works this session.
    }
}

function locate() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setState({ status: 'unavailable' })
        return
    }

    setState({ status: 'locating' })
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            }
            writeCache(coords)
            setState({ coords, status: 'ready' })
        },
        (error) => {
            setState({ status: error.code === error.PERMISSION_DENIED ? 'denied' : 'error' })
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 }
    )
}

function clearLocation() {
    try {
        window.localStorage.removeItem(STORAGE_KEY)
    } catch {
        // ignore
    }
    setState({ coords: null, status: 'idle' })
}

let initialised = false

/**
 * Restores a cached position and, when permission was already granted on a
 * previous visit, refreshes it silently so returning visitors never see a
 * second prompt.
 */
function initialise() {
    if (initialised) return
    initialised = true

    const cached = readCache()
    if (cached) {
        setState({ coords: cached, status: 'ready', hydrated: true })
    } else {
        setState({ hydrated: true })
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        if (!cached) setState({ status: 'unavailable' })
        return
    }

    if (!navigator.permissions?.query) return

    navigator.permissions
        .query({ name: 'geolocation' })
        .then((permission) => {
            if (permission.state === 'granted' && !cached) locate()
            if (permission.state === 'denied') setState({ status: 'denied' })
        })
        .catch(() => {
            // Permissions API unsupported for geolocation; the explicit button
            // remains the way in.
        })
}

export function LocationProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        initialise()
    }, [])

    return <>{children}</>
}

export function useLocation() {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    const request = useCallback(() => {
        locate()
    }, [])

    const clear = useCallback(() => {
        clearLocation()
    }, [])

    return { ...snapshot, request, clear }
}
