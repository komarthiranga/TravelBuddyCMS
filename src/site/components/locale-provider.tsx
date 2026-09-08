'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { CHROME, type ChromeLocale } from '@/site/lib/chrome'

const STORAGE_KEY = 'tb:locale'

type ChromeCopy = { [K in keyof typeof CHROME.en]: string }

type LocaleContextValue = {
    locale: ChromeLocale
    setLocale: (locale: ChromeLocale) => void
    t: ChromeCopy
}

const LocaleContext = createContext<LocaleContextValue>({
    locale: 'en',
    setLocale: () => {},
    t: CHROME.en,
})

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<ChromeLocale>('en')

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY)
            if (stored === 'te' || stored === 'en') setLocaleState(stored)
        } catch {
            // ignore
        }
    }, [])

    useEffect(() => {
        document.documentElement.lang = locale === 'te' ? 'te' : 'en'
    }, [locale])

    const setLocale = useCallback((next: ChromeLocale) => {
        setLocaleState(next)
        try {
            window.localStorage.setItem(STORAGE_KEY, next)
        } catch {
            // ignore
        }
    }, [])

    const value = useMemo(
        () => ({ locale, setLocale, t: CHROME[locale] }),
        [locale, setLocale]
    )

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useChrome() {
    return useContext(LocaleContext)
}
