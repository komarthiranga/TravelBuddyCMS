'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowLeft,
    ArrowRight,
    Hand,
    LoaderCircle,
    MapPin,
    Navigation,
    RotateCcw,
    TriangleAlert,
} from 'lucide-react'

import type { JourneyPlace } from '@/site/api/getPlacesForJourney'
import { BuddyMapRide } from '@/site/components/BuddyMapRide'
import { BuddyMascot, type BuddyPose } from '@/site/components/BuddyMascot'
import { categoryIcon } from '@/site/components/category-icon'
import { useLocation } from '@/site/components/location-provider'
import { distanceKm, formatDistance, formatDuration, nearest, toCoords } from '@/site/lib/geo'
import { greetingForPlace, type Greeting } from '@/site/lib/greetings'
import {
    minutesFor,
    modesForPlace,
    TRAVEL_MODE_ORDER,
    TRAVEL_MODES,
    type TravelMode,
} from '@/site/lib/travelModes'

export type JourneyCity = {
    id: number
    name: string
    state: string
    country: string
    latitude: string | null
    longitude: string | null
}

type Phase = 'hello' | 'interest' | 'mode' | 'ride' | 'arrived' | 'wrapup'

/** What he was asked for: a whole group ("places to see") or one category ("temples"). */
type Interest = { kind: 'type' | 'category'; key: string; label: string }

/** Friendlier names for the `category_type` values set in the CMS. */
const TYPE_LABELS: Record<string, string> = {
    Attraction: 'Places worth seeing',
    Restaurant: 'Somewhere to eat',
    Stay: 'A place to stay',
}

const TYPE_CODES: Record<string, string> = {
    Attraction: 'VIEWPOINT',
    Restaurant: 'RESTAURANT',
    Stay: 'HOTEL',
}

function prefersReducedMotion(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
}

export function BuddyJourney({
    cities,
    places,
}: {
    cities: JourneyCity[]
    places: JourneyPlace[]
}) {
    const { coords, status, hydrated, request } = useLocation()

    const [phase, setPhase] = useState<Phase>('hello')
    const [interest, setInterest] = useState<Interest | null>(null)
    const [mode, setMode] = useState<TravelMode>('auto')
    const [index, setIndex] = useState(0)

    /* ── Where we are ──────────────────────────────────────────── */
    const here = useMemo(() => {
        if (coords) return nearest(coords, cities, (city) => toCoords(city.latitude, city.longitude))
        if (cities.length === 1) return { item: cities[0], km: null }
        return null
    }, [coords, cities])

    const city = here?.item ?? null
    const greeting = greetingForPlace(city?.state ?? null, city?.country ?? null)

    /** Journeys start from you if you shared your location, otherwise from town centre. */
    const origin = useMemo(
        () => coords ?? (city ? toCoords(city.latitude, city.longitude) : null),
        [coords, city]
    )
    const originLabel = coords ? 'from where you are' : `from the middle of ${city?.name ?? 'town'}`

    const cityPlaces = useMemo(
        () => (city ? places.filter((place) => place.city_id === city.id) : []),
        [places, city]
    )

    /* ── What he can offer ─────────────────────────────────────────
       Two levels, because both are natural things to ask a local:
       the broad group ("show me the sights") and the specific one
       ("just the temples"). */
    const { typeGroups, categoryGroups } = useMemo(() => {
        const byType = new Map<string, JourneyPlace[]>()
        const byCategory = new Map<
            string,
            { key: string; name: string; code: string; type: string; places: JourneyPlace[] }
        >()

        for (const place of cityPlaces) {
            const typeBucket = byType.get(place.category_type)
            if (typeBucket) typeBucket.push(place)
            else byType.set(place.category_type, [place])

            const key = String(place.category_id)
            const categoryBucket = byCategory.get(key)
            if (categoryBucket) {
                categoryBucket.places.push(place)
            } else {
                byCategory.set(key, {
                    key,
                    name: place.category_name,
                    code: place.category_code,
                    type: place.category_type,
                    places: [place],
                })
            }
        }

        /* Sightseeing first, then food, then stays. */
        const typeRank = (type: string) =>
            type === 'Attraction' ? 0 : type === 'Restaurant' ? 1 : type === 'Stay' ? 2 : 3

        return {
            typeGroups: [...byType.entries()]
                .map(([type, group]) => ({ type, places: group }))
                .sort((a, b) => typeRank(a.type) - typeRank(b.type)),
            categoryGroups: [...byCategory.values()].sort(
                (a, b) => typeRank(a.type) - typeRank(b.type) || a.name.localeCompare(b.name)
            ),
        }
    }, [cityPlaces])

    const chosenPlaces = useMemo(() => {
        if (!interest) return []
        if (interest.kind === 'type') {
            return typeGroups.find((group) => group.type === interest.key)?.places ?? []
        }
        return categoryGroups.find((group) => group.key === interest.key)?.places ?? []
    }, [interest, typeGroups, categoryGroups])

    /** Nearest first — that is the order a local would actually walk you. */
    const route = useMemo(() => {
        const withDistance = chosenPlaces.map((place) => {
            const target = toCoords(place.latitude, place.longitude)
            return {
                place,
                km: origin && target ? distanceKm(origin, target) : null,
            }
        })
        return withDistance.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity))
    }, [chosenPlaces, origin])

    const leg = route[Math.min(index, Math.max(0, route.length - 1))] ?? null
    const isLastLeg = index >= route.length - 1
    const destination = leg ? toCoords(leg.place.latitude, leg.place.longitude) : null

    function travelTo(nextIndex: number) {
        setIndex(nextIndex)
        const next = route[nextIndex]
        const dest = next ? toCoords(next.place.latitude, next.place.longitude) : null
        setPhase(!dest || prefersReducedMotion() ? 'arrived' : 'ride')
    }

    const pose: BuddyPose =
        phase === 'hello' || phase === 'wrapup' ? 'wave' : phase === 'arrived' ? 'point' : 'talk'

    return (
        <section
            aria-labelledby="journey-heading"
            className="relative isolate overflow-hidden bg-ink text-white"
        >
            {/* Backdrop: the place he is taking you to */}
            <div aria-hidden="true" className="absolute inset-0">
                {leg?.place.primary_image && (
                    <Image
                        src={leg.place.primary_image}
                        alt=""
                        fill
                        preload
                        sizes="100vw"
                        className={`object-cover transition-opacity duration-1000 ${
                            phase === 'arrived' ? 'opacity-70' : 'opacity-35'
                        }`}
                    />
                )}
                {/* Heavy enough that white text stays legible over any photo. */}
                <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/90 to-ink/55" />
                <div className="absolute inset-0 grain opacity-30" />
            </div>

            <h1 id="journey-heading" className="sr-only">
                TravelBuddy — a local friend who takes you around {city?.name ?? 'your city'}
            </h1>

            {phase === 'ride' && leg && origin && destination ? (
                <BuddyMapRide
                    origin={origin}
                    destination={destination}
                    destinationName={leg.place.short_name}
                    mode={mode}
                    originLabel={originLabel}
                    onArrived={() => setPhase('arrived')}
                    onSkip={() => setPhase('arrived')}
                    className="h-[calc(100svh-4rem)] w-full"
                />
            ) : (
            <div className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center gap-6 px-5 pb-14 pt-24 sm:px-8 sm:pb-16">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
                        {/* ── He stands beside you ──────────────── */}
                        <div className="relative shrink-0 self-start lg:self-center">
                            <span
                                aria-hidden="true"
                                className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,oklch(0.74_0.155_58/0.2),transparent_68%)]"
                            />
                            <BuddyMascot
                                pose={pose}
                                title="Your local buddy"
                                className="relative h-44 w-auto sm:h-56 lg:h-[24rem]"
                            />
                        </div>

                        {/* ── And this is him talking ───────────── */}
                        <div className="w-full max-w-2xl">
                            <div
                                aria-live="polite"
                                className="relative rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8"
                            >
                                {phase === 'hello' && (
                                    <HelloPhase
                                        greeting={greeting}
                                        cityName={city?.name ?? null}
                                        km={here?.km ?? null}
                                        placeCount={cityPlaces.length}
                                        status={status}
                                        hydrated={hydrated}
                                        onRequest={request}
                                        onStart={() => setPhase('interest')}
                                    />
                                )}

                                {phase === 'interest' && (
                                    <InterestPhase
                                        cityName={city?.name ?? 'town'}
                                        typeGroups={typeGroups}
                                        categoryGroups={categoryGroups}
                                        onPick={(picked) => {
                                            setInterest(picked)
                                            setIndex(0)
                                            setPhase('mode')
                                        }}
                                    />
                                )}

                                {phase === 'mode' && interest && (
                                    <ModePhase
                                        categoryName={interest.label}
                                        nearestKm={route[0]?.km ?? null}
                                        placeModes={modesForPlace(route[0]?.place.travel_modes ?? [])}
                                        onPick={(picked) => {
                                            setMode(picked)
                                            travelTo(0)
                                        }}
                                        onBack={() => setPhase('interest')}
                                    />
                                )}

                                {phase === 'arrived' && leg && (
                                    <ArrivedPhase
                                        place={leg.place}
                                        km={leg.km}
                                        mode={mode}
                                        index={index}
                                        total={route.length}
                                        onNext={() =>
                                            isLastLeg ? setPhase('wrapup') : travelTo(index + 1)
                                        }
                                        onChange={() => setPhase('interest')}
                                    />
                                )}

                                {phase === 'wrapup' && (
                                    <WrapupPhase
                                        greeting={greeting}
                                        cityName={city?.name ?? 'here'}
                                        count={route.length}
                                        onAgain={() => setPhase('interest')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
            </div>
            )}
        </section>
    )
}

/* ── Hello ──────────────────────────────────────────────────────── */
function HelloPhase({
    greeting,
    cityName,
    km,
    placeCount,
    status,
    hydrated,
    onRequest,
    onStart,
}: {
    greeting: Greeting
    cityName: string | null
    km: number | null
    placeCount: number
    status: string
    hydrated: boolean
    onRequest: () => void
    onStart: () => void
}) {
    return (
        <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                {greeting.helloRoman} — hello in {greeting.language}
            </p>

            <p lang={greeting.lang} className="mt-3 font-display text-4xl leading-none sm:text-6xl">
                {greeting.hello}!
            </p>

            <p className="mt-5 text-lg leading-relaxed text-white/80">
                {cityName ? (
                    <>
                        I&apos;m your buddy in <strong className="font-semibold">{cityName}</strong>.
                        I know {placeCount} {placeCount === 1 ? 'place' : 'places'} here properly —
                        give me your hand and I&apos;ll take you to them one by one.
                    </>
                ) : (
                    <>
                        I&apos;m your local buddy. Let me know where you are and I&apos;ll take you
                        around like I would a friend who just got off the bus.
                    </>
                )}
            </p>

            {km !== null && (
                <p className="mt-3 text-sm text-white/55">
                    You&apos;re {formatDistance(km)} from the middle of town.
                </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onStart}
                    disabled={!cityName || placeCount === 0}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-7 py-3.5 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-white"
                >
                    <Hand className="size-4" aria-hidden="true" />
                    Take my hand
                </button>

                {status !== 'ready' && (
                    <button
                        type="button"
                        onClick={onRequest}
                        disabled={status === 'locating' || status === 'unavailable'}
                        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white outline-none transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-white"
                    >
                        {status === 'locating' ? (
                            <>
                                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                                Finding you…
                            </>
                        ) : (
                            <>
                                <Navigation className="size-4" aria-hidden="true" />
                                Use my location
                            </>
                        )}
                    </button>
                )}
            </div>

            {hydrated && (status === 'denied' || status === 'error') && (
                <p role="status" className="mt-4 text-sm text-white/50">
                    {status === 'denied'
                        ? "Location's blocked — no problem, I'll measure everything from the middle of town instead."
                        : "Couldn't get a fix on you. I'll start from the town centre, it's close enough."}
                </p>
            )}

            {status === 'ready' && (
                <p className="mt-4 text-xs text-white/40">
                    Your location stays in this browser. I never send it anywhere.
                </p>
            )}
        </>
    )
}

/* ── What are you interested in ─────────────────────────────────── */
function InterestPhase({
    cityName,
    typeGroups,
    categoryGroups,
    onPick,
}: {
    cityName: string
    typeGroups: { type: string; places: JourneyPlace[] }[]
    categoryGroups: { key: string; name: string; code: string; places: JourneyPlace[] }[]
    onPick: (interest: Interest) => void
}) {
    return (
        <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                Your call
            </p>
            <p className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                What are you in the mood for in {cityName}?
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                Pick one and I&apos;ll take you there myself — nearest first, so we don&apos;t waste
                your day going back and forth.
            </p>

            <ul className="mt-7 grid gap-3">
                {typeGroups.map((group) => {
                    const label = TYPE_LABELS[group.type] ?? group.type
                    const Icon = categoryIcon(TYPE_CODES[group.type] ?? '')
                    return (
                        <li key={group.type}>
                            <button
                                type="button"
                                onClick={() =>
                                    onPick({ kind: 'type', key: group.type, label })
                                }
                                className="group flex w-full items-center gap-3.5 rounded-2xl border border-white/25 bg-white/10 p-4 text-left outline-none transition hover:border-amber-brand hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-brand text-ink">
                                    <Icon className="size-5" aria-hidden="true" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold">{label}</span>
                                    <span className="block text-xs text-white/55">
                                        {group.places.length}{' '}
                                        {group.places.length === 1 ? 'place' : 'places'}, and
                                        I&apos;ll walk you through{' '}
                                        {group.places.length === 1 ? 'it' : 'each one'}
                                    </span>
                                </span>
                                <ArrowRight
                                    className="ml-auto size-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5"
                                    aria-hidden="true"
                                />
                            </button>
                        </li>
                    )
                })}
            </ul>

            {categoryGroups.length > 1 && (
                <>
                    <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                        Or something specific
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {categoryGroups.map((group) => {
                            const Icon = categoryIcon(group.code)
                            return (
                                <li key={group.key}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onPick({
                                                kind: 'category',
                                                key: group.key,
                                                label: group.name,
                                            })
                                        }
                                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-medium outline-none transition hover:border-amber-brand hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        <Icon
                                            className="size-3.5 text-amber-brand"
                                            aria-hidden="true"
                                        />
                                        {group.name}
                                        <span className="text-white/45">
                                            {group.places.length}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </>
            )}
        </>
    )
}

/* ── How shall we travel ────────────────────────────────────────── */
function ModePhase({
    categoryName,
    nearestKm,
    placeModes,
    onPick,
    onBack,
}: {
    categoryName: string
    nearestKm: number | null
    placeModes: TravelMode[]
    onPick: (mode: TravelMode) => void
    onBack: () => void
}) {
    return (
        <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                {categoryName}
            </p>
            <p className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                Good choice. How do you want to get there?
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                {nearestKm === null
                    ? "Pick whatever suits you and I'll come along."
                    : `The first one is ${formatDistance(nearestKm)} away as the crow flies — the road will be a bit longer. Pick your ride, I'm coming with you either way.`}
            </p>

            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                {TRAVEL_MODE_ORDER.map((option) => {
                    const config = TRAVEL_MODES[option]
                    const minutes = nearestKm === null ? null : minutesFor(nearestKm, option)
                    const tooFar =
                        nearestKm !== null && nearestKm > config.comfortableUpToKm
                    const recommended = placeModes.includes(option) && !tooFar

                    return (
                        <li key={option}>
                            <button
                                type="button"
                                onClick={() => onPick(option)}
                                className={`group flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white ${
                                    recommended
                                        ? 'border-white/25 bg-white/10 hover:border-amber-brand hover:bg-white/20'
                                        : 'border-dashed border-white/20 bg-white/5 hover:bg-white/10'
                                }`}
                            >
                                <span
                                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                                        recommended
                                            ? 'bg-amber-brand text-ink'
                                            : 'bg-white/10 text-white/60'
                                    }`}
                                >
                                    <config.icon className="size-5" aria-hidden="true" />
                                </span>
                                <span className="min-w-0">
                                    <span className="flex items-center gap-2 text-sm font-semibold">
                                        {config.label}
                                        {recommended && (
                                            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                                                Works
                                            </span>
                                        )}
                                    </span>
                                    <span className="mt-0.5 block text-xs leading-snug text-white/55">
                                        {tooFar && nearestKm !== null
                                            ? `Honestly too far — ${formatDistance(nearestKm)} this way`
                                            : minutes !== null
                                              ? `About ${formatDuration(minutes)} · ${config.hint}`
                                              : config.hint}
                                    </span>
                                </span>
                            </button>
                        </li>
                    )
                })}
            </ul>

            <button
                type="button"
                onClick={onBack}
                className="mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/60 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-white"
            >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Something else, actually
            </button>
        </>
    )
}

/* ── Arrived ────────────────────────────────────────────────────── */
function ArrivedPhase({
    place,
    km,
    mode,
    index,
    total,
    onNext,
    onChange,
}: {
    place: JourneyPlace
    km: number | null
    mode: TravelMode
    index: number
    total: number
    onNext: () => void
    onChange: () => void
}) {
    const free = Number.parseFloat(place.entry_fee) === 0
    const isLast = index >= total - 1

    return (
        <div className="animate-buddy-rise">
            <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                    We&apos;re here · {place.category_name}
                </p>
                <p className="text-xs text-white/45">
                    Stop {index + 1} of {total}
                </p>
            </div>

            <p className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                {place.short_name}
            </p>

            <p className="mt-4 text-[15px] leading-relaxed text-white/80">
                {place.short_description}
            </p>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
                {km !== null && (
                    <li className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-amber-brand" aria-hidden="true" />
                        {formatDistance(km)} out, {TRAVEL_MODES[mode].label.toLowerCase()}
                    </li>
                )}
                <li>{free ? 'Free entry' : `Entry ₹${place.entry_fee}`}</li>
                {place.best_time_to_visit && <li>Best: {place.best_time_to_visit}</li>}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                    href={`/attractions/${place.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-6 py-3 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                >
                    Take me inside
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                >
                    {isLast ? "That's the lot" : 'On to the next one'}
                </button>
                <button
                    type="button"
                    onClick={onChange}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-3 text-sm font-medium text-white/60 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Change my mind
                </button>
            </div>

            {place.short_name.startsWith('Sample') && (
                <p className="mt-6 flex items-start gap-2 rounded-2xl border border-amber-brand/30 bg-amber-brand/10 px-4 py-3 text-xs text-white/70">
                    <TriangleAlert
                        className="mt-0.5 size-4 shrink-0 text-amber-brand"
                        aria-hidden="true"
                    />
                    This is a placeholder entry from the demo data — swap it for a real one in the
                    content manager.
                </p>
            )}
        </div>
    )
}

/* ── Wrap up ────────────────────────────────────────────────────── */
function WrapupPhase({
    greeting,
    cityName,
    count,
    onAgain,
}: {
    greeting: Greeting
    cityName: string
    count: number
    onAgain: () => void
}) {
    return (
        <div className="animate-buddy-rise">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                {greeting.thanksRoman}
            </p>
            <p lang={greeting.lang} className="mt-3 font-display text-4xl leading-none sm:text-5xl">
                {greeting.thanks}!
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-white/80">
                That&apos;s {count === 1 ? 'the only one' : `all ${count}`} I know in {cityName} for
                that. Ask me for something else and we&apos;ll set off again — I&apos;ve got nowhere
                better to be.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onAgain}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-6 py-3 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Show me something else
                </button>
                <Link
                    href="/attractions"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                >
                    Just show me the list
                </Link>
            </div>
        </div>
    )
}
