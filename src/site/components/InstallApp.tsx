'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useChrome } from './locale-provider'

function subscribeOnline(callback: () => void) {
    window.addEventListener('online', callback)
    window.addEventListener('offline', callback)
    return () => {
        window.removeEventListener('online', callback)
        window.removeEventListener('offline', callback)
    }
}

function onlineSnapshot() {
    return navigator.onLine
}

export function InstallApp() {
    const { locale } = useChrome()
    const online = useSyncExternalStore(subscribeOnline, onlineSnapshot, () => true)

    useEffect(() => {
        if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
                .catch(() => console.warn('Travel Buddy offline support could not start.'))
        }
    }, [])

    if (online) return null

    return (
        <p role="status" className="fixed inset-x-0 top-0 z-[100] bg-amber-100 px-4 py-2 text-center text-sm text-ink">
            {locale === 'te'
                ? 'మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. ప్రదేశాలు, దిశల కోసం ఇంటర్నెట్ అవసరం.'
                : 'You’re offline. Places and directions need an internet connection.'}
        </p>
    )
}
