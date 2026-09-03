'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowLeft,
    ArrowRight,
    BedDouble,
    Hand,
    Landmark,
    LifeBuoy,
    LoaderCircle,
    MapPin,
    Navigation,
    RotateCcw,
    Utensils,
} from 'lucide-react'

import type { PublicAttractionCard } from '@/site/api/getPublishedAttractions'
import { formatFee } from '@/site/components/AttractionCard'
import { BuddyAvatar, type BuddyPose } from '@/site/components/BuddyAvatar'
import { useLocation } from '@/site/components/location-provider'
import { distanceKm, formatDistance, nearest, toCoords, travelSummary } from '@/site/lib/geo'
import { greetingForPlace } from '@/site/lib/greetings'

export type JourneyCity = {
    id: number
    name: string
    state: string
    country: string
    latitude: string | null
    longitude: string | null
    attraction_count: number
}

type Phase = 'hello' | 'menu' | 'tour' | 'soon' | 'wrapup'

type Topic = 'attractions' | 'food' | 'stays' | 'help'

const TOPICS: {
    id: Topic
    label: string
    hint: string
    icon: typeof Landmark
    /** What he says when he cannot help yet. */
    excuse: string
}[] = [
    {
        id: 'attractions',
        label: 'Places to see',
        hint: 'Temples, parks, viewpoints',
        icon: Landmark,
        excuse: '',
    },
    {
        id: 'food',
        label: 'Somewhere to eat',
        hint: 'Tiffin, biryani, street food',
        icon: Utensils,
        excuse: "I eat out every day, but I haven't written any of it down yet. Give me a little time and I'll have the good tiffin places ready for you.",
    },
    {
        id: 'stays',
        label: 'A place to stay',
        hint: 'Lodges and hotels',
        icon: BedDouble,
        excuse: "I don't have stays in my notes yet. When I do, I'll only put down places I'd let my own cousin sleep in.",
    },
    {
        id: 'help',
        label: 'If something goes wrong',
        hint: 'Hospital, police, pharmacy',
        icon: LifeBuoy,
        excuse: "This one I want to get exactly right before I promise anything — wrong directions to a hospital is worse than none. It's next on my list.",
    },
]

/** How he introduces each stop, so the tour does not read like a list. */
function stopIntro(index: number, total: number): string {
    if (total === 1) return "There's only one place I know here well — but it's a good one."
    if (index === 0) return "First stop. Stay with me, it's this way."
    if (index === total - 1) return 'Last one, and I saved it on purpose.'
    return 'Right, come on — next one.'
}

export function BuddyJourney({
    cities,
    attractions,
}: {
    cities: JourneyCity[]
    attractions: PublicAttractionCard[]
}) {
    const { coords, status, hydrated, request } = useLocation()

    const [phase, setPhase] = useState<Phase>('hello')
    const [stop, setStop] = useState(0)
    const [topic, setTopic] = useState<Topic>('attractions')
    const [walking, setWalking] = useState(false)
    const walkTimer = useRef<number | null>(null)

    useEffect(
        () => () => {
            if (walkTimer.current) window.clearTimeout(walkTimer.current)
        },
        []
    )

    /** The city he speaks for: whichever one you are closest to. */
    const here = useMemo(() => {
        if (coords) return nearest(coords, cities, (city) => toCoords(city.latitude, city.longitude))
        if (cities.length === 1) return { item: cities[0], km: null }
        return null
    }, [coords, cities])

    const city = here?.item ?? null
    const greeting = greetingForPlace(city?.state ?? null, city?.country ?? null)

    const stops = useMemo(
        () => (city ? attractions.filter((item) => item.city_id === city.id) : []),
        [attractions, city]
    )

    const current = stops[Math.min(stop, Math.max(0, stops.length - 1))] ?? null

    const currentDistance = useMemo(() => {
        const target = current ? toCoords(current.latitude, current.longitude) : null
        if (!coords || !target) return null
        const km = distanceKm(coords, target)
        return `${formatDistance(km)} from you — ${travelSummary(km)}`
    }, [coords, current])

    function walkTo(next: number) {
        setStop(next)
        setWalking(true)
        if (walkTimer.current) window.clearTimeout(walkTimer.current)
        walkTimer.current = window.setTimeout(() => setWalking(false), 800)
    }

    const pose: BuddyPose = walking
        ? 'walk'
        : phase === 'hello' || phase === 'wrapup'
          ? 'wave'
          : phase === 'tour'
            ? 'point'
            : 'talk'

    const topicConfig = TOPICS.find((item) => item.id === topic) ?? TOPICS[0]

    return (
        <section
            aria-labelledby="journey-heading"
            className="relative isolate overflow-hidden bg-ink text-white"
        >
            {/* Backdrop: the place he is currently showing you */}
            <div aria-hidden="true" className="absolute inset-0">
                {current?.primary_image && (
                    <Image
                        src={current.primary_image}
                        alt=""
                        fill
                        preload
                        sizes="100vw"
                        className={`object-cover transition-opacity duration-700 ${
                            phase === 'tour' ? 'opacity-100' : 'opacity-70'
                        }`}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/80 to-ink/35" />
                <div className="absolute inset-0 grain opacity-30" />
            </div>

            <h1 id="journey-heading" className="sr-only">
                TravelBuddy — a local friend who walks you through {city?.name ?? 'your city'}
            </h1>

            <div className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center gap-6 px-5 pb-14 pt-24 sm:px-8 sm:pb-16 lg:flex-row lg:items-center lg:gap-10">
                {/* ── He stands here, beside you ─────────────────── */}
                <div className="relative shrink-0 self-start lg:self-center">
                    <span
                        aria-hidden="true"
                        className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,oklch(0.74_0.155_58/0.2),transparent_68%)]"
                    />
                    <BuddyAvatar
                        pose={pose}
                        title="Your local buddy"
                        className="relative h-44 w-auto sm:h-60 lg:h-[27rem]"
                    />
                </div>

                {/* ── And this is him talking ────────────────────── */}
                <div className="w-full max-w-2xl">
                    <div
                        aria-live="polite"
                        className="relative rounded-[1.75rem] rounded-bl-md border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8 lg:rounded-bl-[1.75rem]"
                    >
                        <span
                            aria-hidden="true"
                            className="absolute -left-1.5 top-1/2 hidden size-4 -translate-y-1/2 rotate-45 border-b border-l border-white/15 bg-white/10 backdrop-blur-md lg:block"
                        />

                        {phase === 'hello' && (
                            <HelloPhase
                                greeting={greeting}
                                city={city}
                                km={here?.km ?? null}
                                status={status}
                                hydrated={hydrated}
                                onRequest={request}
                                onStart={() => setPhase('menu')}
                            />
                        )}

                        {phase === 'menu' && (
                            <MenuPhase
                                cityName={city?.name ?? 'your city'}
                                placeCount={stops.length}
                                onPick={(picked) => {
                                    setTopic(picked)
                                    if (picked === 'attractions' && stops.length > 0) {
                                        setStop(0)
                                        setPhase('tour')
                                    } else {
                                        setPhase('soon')
                                    }
                                }}
                            />
                        )}

                        {phase === 'tour' && current && (
                            <TourPhase
                                key={current.id}
                                attraction={current}
                                index={stop}
                                total={stops.length}
                                distance={currentDistance}
                                onBack={() =>
                                    stop === 0 ? setPhase('menu') : walkTo(stop - 1)
                                }
                                onNext={() =>
                                    stop === stops.length - 1
                                        ? setPhase('wrapup')
                                        : walkTo(stop + 1)
                                }
                            />
                        )}

                        {phase === 'soon' && (
                            <SoonPhase
                                label={topicConfig.label}
                                excuse={topicConfig.excuse}
                                hasPlaces={stops.length > 0}
                                onBack={() => setPhase('menu')}
                                onPlaces={() => {
                                    setTopic('attractions')
                                    setStop(0)
                                    setPhase('tour')
                                }}
                            />
                        )}

                        {phase === 'wrapup' && (
                            <WrapupPhase
                                greeting={greeting}
                                cityName={city?.name ?? 'here'}
                                count={stops.length}
                                onRestart={() => {
                                    setStop(0)
                                    setPhase('tour')
                                }}
                                onMenu={() => setPhase('menu')}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ── Phases ─────────────────────────────────────────────────────── */

type GreetingShape = ReturnType<typeof greetingForPlace>

function HelloPhase({
    greeting,
    city,
    km,
    status,
    hydrated,
    onRequest,
    onStart,
}: {
    greeting: GreetingShape
    city: JourneyCity | null
    km: number | null
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

            <p
                lang={greeting.lang}
                className="mt-3 font-display text-4xl leading-none sm:text-6xl"
            >
                {greeting.hello}!
            </p>

            <p className="mt-5 text-lg leading-relaxed text-white/80">
                {city ? (
                    <>
                        I&apos;m your buddy in <strong className="font-semibold">{city.name}</strong>
                        . I grew up around these streets, so let me show you around properly —
                        no guesswork, no tourist traps.
                    </>
                ) : (
                    <>
                        I&apos;m your local buddy. Tell me where you are and I&apos;ll show you
                        around like I would a friend who just got off the bus.
                    </>
                )}
            </p>

            {km !== null && (
                <p className="mt-3 text-sm text-white/55">
                    You&apos;re {formatDistance(km)} from the middle of town —{' '}
                    {travelSummary(km)}.
                </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onStart}
                    disabled={!city}
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
                        ? "Location's blocked — that's fine, I'll still walk you through everything I know."
                        : "Couldn't get a fix on you. Doesn't matter, come along anyway."}
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

function MenuPhase({
    cityName,
    placeCount,
    onPick,
}: {
    cityName: string
    placeCount: number
    onPick: (topic: Topic) => void
}) {
    return (
        <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                Your call
            </p>
            <p className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                So — what are you after in {cityName}?
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                Point at one and I&apos;ll take you there myself. I&apos;ll be straight with you
                about the ones I don&apos;t know yet.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {TOPICS.map((item) => {
                    const live = item.id === 'attractions' && placeCount > 0
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onPick(item.id)}
                                className={`group flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white ${
                                    live
                                        ? 'border-white/25 bg-white/10 hover:border-amber-brand hover:bg-white/20'
                                        : 'border-dashed border-white/20 bg-white/5 hover:bg-white/10'
                                }`}
                            >
                                <span
                                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                                        live ? 'bg-amber-brand text-ink' : 'bg-white/10 text-white/60'
                                    }`}
                                >
                                    <item.icon className="size-5" aria-hidden="true" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold">{item.label}</span>
                                    <span className="block truncate text-xs text-white/55">
                                        {live
                                            ? `${placeCount} place${placeCount === 1 ? '' : 's'} I know well`
                                            : item.id === 'attractions'
                                              ? 'Nothing here yet'
                                              : item.hint}
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
        </>
    )
}

function TourPhase({
    attraction,
    index,
    total,
    distance,
    onBack,
    onNext,
}: {
    attraction: PublicAttractionCard
    index: number
    total: number
    distance: string | null
    onBack: () => void
    onNext: () => void
}) {
    return (
        <div className="animate-buddy-rise">
            <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                    {attraction.category_name}
                </p>
                <p className="text-xs text-white/45">
                    Stop {index + 1} of {total}
                </p>
            </div>

            <p className="mt-3 text-[15px] italic leading-relaxed text-white/60">
                {stopIntro(index, total)}
            </p>

            <p className="mt-1 font-display text-3xl leading-tight sm:text-4xl">
                {attraction.short_name}
            </p>

            <p className="mt-4 text-[15px] leading-relaxed text-white/80">
                {attraction.short_description}
            </p>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
                {distance && (
                    <li className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-amber-brand" aria-hidden="true" />
                        {distance}
                    </li>
                )}
                <li>{formatFee(attraction.entry_fee, attraction.currency_code)}</li>
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                    href={`/attractions/${attraction.slug}`}
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
                    {index === total - 1 ? "That's the lot" : 'Walk me to the next one'}
                </button>
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-3 text-sm font-medium text-white/60 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    {index === 0 ? 'Ask me something else' : 'Back'}
                </button>
            </div>
        </div>
    )
}

function SoonPhase({
    label,
    excuse,
    hasPlaces,
    onBack,
    onPlaces,
}: {
    label: string
    excuse: string
    hasPlaces: boolean
    onBack: () => void
    onPlaces: () => void
}) {
    return (
        <div className="animate-buddy-rise">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                {label}
            </p>
            <p className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                Ah — here I have to be honest with you.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-white/80">{excuse}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
                {hasPlaces && (
                    <button
                        type="button"
                        onClick={onPlaces}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-6 py-3 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Show me places instead
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Ask me something else
                </button>
            </div>
        </div>
    )
}

function WrapupPhase({
    greeting,
    cityName,
    count,
    onRestart,
    onMenu,
}: {
    greeting: GreetingShape
    cityName: string
    count: number
    onRestart: () => void
    onMenu: () => void
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
                That&apos;s {count === 1 ? 'the one place' : `all ${count} places`} I know properly
                in {cityName}. Go see {count === 1 ? 'it' : 'them'} — and come back, because
                I&apos;m still learning this town myself.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onRestart}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-6 py-3 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Walk me through again
                </button>
                <button
                    type="button"
                    onClick={onMenu}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Ask me something else
                </button>
            </div>
        </div>
    )
}
