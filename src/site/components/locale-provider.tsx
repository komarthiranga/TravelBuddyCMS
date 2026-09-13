'use client'

import { useSyncExternalStore, type ReactNode } from 'react'
import { CHROME, type ChromeLocale } from '@/site/lib/chrome'

const STORAGE_KEY = 'tb:locale'
let memoryLocale: ChromeLocale = 'en'
function subscribe(listener: () => void) {
    window.addEventListener('storage', listener)
    window.addEventListener('tb-locale', listener)
    return () => {
        window.removeEventListener('storage', listener)
        window.removeEventListener('tb-locale', listener)
    }
}
function getLocale(): ChromeLocale {
    try {
        const value = window.localStorage.getItem(STORAGE_KEY)
        return value === 'te' ? 'te' : 'en'
    } catch {
        return memoryLocale
    }
}
function serverLocale(): ChromeLocale {
    return 'en'
}
function setLocale(locale: ChromeLocale) {
    memoryLocale = locale
    try {
        window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
        /* Still usable this session. */
    }
    window.dispatchEvent(new Event('tb-locale'))
}
export function LocaleProvider({ children }: { children: ReactNode }) {
    return <>{children}</>
}
export function useChrome() {
    const locale = useSyncExternalStore(subscribe, getLocale, serverLocale)
    return { locale, setLocale, t: CHROME[locale] }
}
