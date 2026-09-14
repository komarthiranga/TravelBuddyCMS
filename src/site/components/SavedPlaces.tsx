'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Bookmark, Check, Trash2, ArrowRight } from 'lucide-react'
import { AccessibleDialog } from './AccessibleDialog'
import { useChrome } from './locale-provider'

export type SavedPlace = {
    id: number
    name: string
    slug: string
    city: string
}
const KEY = 'tb:saved-places:v1'
const EMPTY: SavedPlace[] = []
let cachedRaw: string | null = null
let cached: SavedPlace[] = EMPTY
function snapshot() {
    try {
        const raw = localStorage.getItem(KEY)
        if (raw === cachedRaw) return cached
        cachedRaw = raw
        const parsed: unknown = raw ? JSON.parse(raw) : []
        cached = Array.isArray(parsed)
            ? parsed
                  .filter(
                      (place): place is SavedPlace =>
                          typeof place === 'object' &&
                          place !== null &&
                          Number.isSafeInteger(place.id) &&
                          typeof place.name === 'string' &&
                          typeof place.slug === 'string' &&
                          typeof place.city === 'string',
                  )
                  .slice(0, 100)
            : EMPTY
    } catch {
        cached = EMPTY
    }
    return cached
}
function subscribe(listener: () => void) {
    window.addEventListener('storage', listener)
    window.addEventListener('tb-saved', listener)
    return () => {
        window.removeEventListener('storage', listener)
        window.removeEventListener('tb-saved', listener)
    }
}
function useSavedPlaces() {
    return useSyncExternalStore(subscribe, snapshot, () => EMPTY)
}
function save(places: SavedPlace[]) {
    try {
        localStorage.setItem(KEY, JSON.stringify(places))
        window.dispatchEvent(new Event('tb-saved'))
        return true
    } catch {
        return false
    }
}

export function SavePlaceButton({
    place,
    compact = false,
}: {
    place: SavedPlace
    compact?: boolean
}) {
    const places = useSavedPlaces()
    const saved = places.some((item) => item.id === place.id)
    const { locale } = useChrome()
    const te = locale === 'te'
    const [error, setError] = useState(false)
    return (
        <span
            lang={locale}
            className="relative z-10 inline-flex flex-col items-start"
        >
            <button
                type="button"
                aria-pressed={saved}
                aria-label={
                    saved
                        ? `${te ? 'సేవ్ చేసిన ప్రదేశం' : 'Saved place'}: ${place.name}`
                        : `${te ? 'సేవ్ చేయండి' : 'Save place'}: ${place.name}`
                }
                onClick={() => {
                    const next = saved
                        ? places.filter((item) => item.id !== place.id)
                        : [...places, place]
                    setError(next.length > 100 || !save(next))
                }}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand ${saved ? 'border-teal-brand/25 bg-teal-wash text-teal-brand-dark' : 'border-ink/15 bg-white text-ink hover:bg-cream'}`}
            >
                {saved ? (
                    <Check className="size-4" aria-hidden="true" />
                ) : (
                    <Bookmark className="size-4" aria-hidden="true" />
                )}
                {saved
                    ? te
                        ? 'సేవ్ అయింది'
                        : 'Saved'
                    : te
                      ? 'సేవ్'
                      : compact
                        ? 'Save'
                        : 'Save for later'}
            </button>
            {error && (
                <span
                    role="alert"
                    className="mt-2 max-w-60 rounded-lg bg-white p-2 text-sm text-ink"
                >
                    {te
                        ? 'సేవ్ చేయలేకపోయాను. బ్రౌజర్ స్టోరేజ్‌ను తనిఖీ చేయండి లేదా పాత ప్రదేశాలను తొలగించండి.'
                        : 'Couldn’t save. Check browser storage or remove an older saved place.'}
                </span>
            )}
        </span>
    )
}

export function SavedPlacesButton({ mobile = false }: { mobile?: boolean }) {
    const places = useSavedPlaces()
    const [open, setOpen] = useState(false)
    const [error, setError] = useState(false)
    const { locale } = useChrome()
    const te = locale === 'te'
    return (
        <>
            <button
                type="button"
                lang={locale}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => {
                    setError(false)
                    setOpen(true)
                }}
                className={mobile ? "flex min-h-14 w-full flex-col items-center justify-center gap-1 text-sm font-semibold text-ink focus-visible:ring-2 focus-visible:ring-teal-brand" : "inline-flex min-h-12 items-center gap-1 rounded-full px-2 text-sm font-semibold text-ink hover:bg-white focus-visible:outline-2 focus-visible:outline-teal-brand"}
            >
                <Bookmark className="size-4" aria-hidden="true" />
                {te ? 'సేవ్ చేసినవి' : 'My places'}
                {places.length > 0 && (
                    <span className="flex min-w-5 items-center justify-center rounded-full bg-teal-wash px-1 text-xs text-teal-brand-dark">
                        {places.length}
                    </span>
                )}
            </button>
            {open && (
                <AccessibleDialog
                    label={te ? 'సేవ్ చేసిన ప్రదేశాలు' : 'Your saved places'}
                    onClose={() => setOpen(false)}
                >
                    <div lang={locale}>
                        <p className="text-sm font-semibold text-teal-brand-dark">
                            {te
                                ? 'మీ చిన్న ప్రయాణ జాబితా'
                                : 'Your little city list'}
                        </p>
                        <h2 className="mt-2 font-display text-3xl">
                            {te
                                ? 'వెళ్లాలనుకున్న ప్రదేశాలు'
                                : 'Keep the places that catch your eye.'}
                        </h2>
                        <p className="mt-3 text-base text-ink-soft">
                            {te
                                ? 'ఈ బ్రౌజర్‌లో మాత్రమే సేవ్ అవుతాయి. ఖాతా అవసరం లేదు.'
                                : 'Saved in this browser, just for you. No account needed.'}
                        </p>
                        {error && (
                            <p role="alert" className="mt-3 text-sm">
                                {te
                                    ? 'తొలగించలేకపోయాను. మళ్లీ ప్రయత్నించండి.'
                                    : 'Couldn’t remove that place. Please try again.'}
                            </p>
                        )}
                        {places.length === 0 ? (
                            <div className="mt-5 rounded-2xl border border-dashed border-teal-brand/30 bg-teal-wash p-5">
                                <Bookmark
                                    className="size-7 text-teal-brand-dark"
                                    aria-hidden="true"
                                />
                                <p className="mt-3 text-base">
                                    {te
                                        ? 'నచ్చిన ప్రదేశం వద్ద సేవ్ నొక్కండి. ఇక్కడ కనిపిస్తుంది.'
                                        : 'See somewhere you like? Tap Save and it will be waiting here.'}
                                </p>
                                <Link
                                    href="/attractions"
                                    onClick={() => setOpen(false)}
                                    className="mt-4 inline-flex min-h-12 items-center gap-2 font-semibold text-teal-brand-dark"
                                >
                                    {te
                                        ? 'ప్రదేశాలు చూడండి'
                                        : 'Find your first place'}
                                    <ArrowRight
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </div>
                        ) : (
                            <ul className="mt-5 space-y-3">
                                {places.map((place) => (
                                    <li
                                        key={place.id}
                                        className="flex items-center gap-2 rounded-2xl border border-hairline bg-white p-4"
                                    >
                                        <Link
                                            href={`/attractions/${encodeURIComponent(place.slug)}`}
                                            onClick={() => setOpen(false)}
                                            className="min-w-0 flex-1 rounded focus-visible:outline-2 focus-visible:outline-teal-brand"
                                        >
                                            <span
                                                lang="en"
                                                className="block font-semibold"
                                            >
                                                {place.name}
                                            </span>
                                            <span
                                                lang="en"
                                                className="mt-1 block text-sm text-ink-soft"
                                            >
                                                {place.city}
                                            </span>
                                        </Link>
                                        <button
                                            type="button"
                                            aria-label={`${te ? 'తొలగించండి' : 'Remove'} ${place.name}`}
                                            onClick={() =>
                                                setError(
                                                    !save(
                                                        places.filter(
                                                            (item) =>
                                                                item.id !==
                                                                place.id,
                                                        ),
                                                    ),
                                                )
                                            }
                                            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline hover:bg-cream focus-visible:outline-2 focus-visible:outline-teal-brand"
                                        >
                                            <Trash2
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </AccessibleDialog>
            )}
        </>
    )
}
