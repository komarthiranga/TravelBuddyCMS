'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'

import { TakeMeThere } from '@/site/components/TakeMeThere'
import { useLocation } from '@/site/components/location-provider'
import { BuddyMascot } from '@/site/components/BuddyMascot'
import type { Greeting } from '@/site/lib/greetings'
import { distanceKm, formatDistance, toCoords, travelSummary } from '@/site/lib/geo'

type GuideImage = { url: string; alt: string }

type GuideStep = {
    id: string
    chip: string
    heading: string
    /** Rendered as the buddy's spoken paragraphs. */
    body: string[]
    bullets?: string[]
    imageIndex: number
    pose: 'wave' | 'talk'
}

export function BuddyGuide({
    name,
    cityName,
    greeting,
    shortDescription,
    storyParagraphs,
    tips,
    travelModes,
    feeLabel,
    isFree,
    hours,
    bestTime,
    address,
    latitude,
    longitude,
    images,
}: {
    name: string
    cityName: string
    greeting: Greeting
    shortDescription: string
    storyParagraphs: string[]
    tips: string[]
    travelModes: { label: string; line: string }[]
    feeLabel: string
    isFree: boolean
    hours: string | null
    bestTime: string | null
    address: string
    mapUrl: string
    latitude: string | null
    longitude: string | null
    images: GuideImage[]
}) {
    const [index, setIndex] = useState(0)
    const { coords } = useLocation()

    const distanceLine = useMemo(() => {
        const target = toCoords(latitude, longitude)
        if (!coords || !target) return null
        const km = distanceKm(coords, target)
        return `You're ${formatDistance(km)} away right now — ${travelSummary(km)}.`
    }, [coords, latitude, longitude])

    const steps = useMemo<GuideStep[]>(() => {
        const list: GuideStep[] = []
        const lastImage = Math.max(0, images.length - 1)

        list.push({
            id: 'hello',
            chip: greeting.helloRoman,
            heading: `${greeting.hello}!`,
            body: [
                `I'm your buddy here in ${cityName}. ${distanceLine ?? ''}`.trim(),
                `Come — ${greeting.comeAlong} (${greeting.comeAlongRoman}). Let me take you inside ${name} myself.`,
            ],
            imageIndex: 0,
            pose: 'wave',
        })

        list.push({
            id: 'what',
            chip: 'First look',
            heading: `So, what is ${name}?`,
            body: [shortDescription],
            imageIndex: 0,
            pose: 'talk',
        })

        storyParagraphs.slice(0, 3).forEach((paragraph, i) => {
            list.push({
                id: `story-${i}`,
                chip: i === 0 ? 'Walking in' : 'Further in',
                heading: i === 0 ? 'Right, follow me in…' : 'And then this bit…',
                body: [paragraph],
                imageIndex: Math.min(i + 1, lastImage),
                pose: 'talk',
            })
        })

        if (travelModes.length > 0) {
            list.push({
                id: 'reach',
                chip: 'Getting here',
                heading: 'How you get here',
                body: [
                    `Look for ${address}.`,
                    distanceLine ?? 'Pick whichever way suits how you are travelling.',
                ],
                bullets: travelModes.map((mode) => `${mode.label} — ${mode.line}`),
                imageIndex: Math.min(1, lastImage),
                pose: 'talk',
            })
        }

        if (tips.length > 0) {
            list.push({
                id: 'tips',
                chip: 'Between us',
                heading: "Things I'd only tell a friend",
                body: [],
                bullets: tips.slice(0, 5),
                imageIndex: lastImage,
                pose: 'talk',
            })
        }

        list.push({
            id: 'practical',
            chip: 'Quick facts',
            heading: 'Money and timing',
            body: [],
            bullets: [
                isFree ? 'Entry is free — nothing to pay.' : `Entry costs ${feeLabel}.`,
                hours ? `Open ${hours}.` : 'Timings vary — check before you set out.',
                ...(bestTime ? [`Best time to come: ${bestTime}.`] : []),
            ],
            imageIndex: Math.min(2, lastImage),
            pose: 'talk',
        })

        list.push({
            id: 'bye',
            chip: greeting.thanksRoman,
            heading: `${greeting.thanks}!`,
            body: [
                `That's ${name} — now go see it properly.`,
                `If you get lost, open the map and follow the pin. I'll be right here when you pick the next place.`,
            ],
            imageIndex: 0,
            pose: 'wave',
        })

        return list
    }, [
        address,
        bestTime,
        cityName,
        distanceLine,
        feeLabel,
        greeting,
        hours,
        images.length,
        isFree,
        name,
        shortDescription,
        storyParagraphs,
        tips,
        travelModes,
    ])

    const safeIndex = Math.min(index, steps.length - 1)
    const step = steps[safeIndex]
    const isFirst = safeIndex === 0
    const isLast = safeIndex === steps.length - 1
    const chipsRef = useRef<HTMLDivElement>(null)
    const progress = steps.length > 1 ? (safeIndex / (steps.length - 1)) * 100 : 100

    useEffect(() => {
        const root = chipsRef.current
        const chip = root?.querySelector<HTMLElement>(`[data-step="${safeIndex}"]`)
        if (!root || !chip) return
        const left = chip.offsetLeft - (root.clientWidth - chip.clientWidth) / 2
        root.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
    }, [safeIndex])

    return (
        <section
            aria-labelledby="buddy-guide-heading"
            className="relative isolate overflow-hidden rounded-[1.5rem] border border-hairline bg-ink text-white sm:rounded-[2rem]"
        >
            <h2 id="buddy-guide-heading" className="sr-only">
                A guided walk through {name} with your local buddy
            </h2>

            <div aria-hidden="true" className="absolute inset-0">
                {images.length > 0 ? (
                    images.map((image, i) => (
                        <Image
                            key={image.url}
                            src={image.url}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 1100px"
                            className={`object-cover transition-opacity duration-700 ${
                                i === step.imageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                    ))
                ) : (
                    <div className="size-full grain" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/88 to-ink/50" />
            </div>

            <div className="relative flex min-h-[min(38rem,88svh)] flex-col justify-between gap-5 p-4 sm:min-h-[36rem] sm:gap-8 sm:p-8 lg:p-10">
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                            Walk with me
                        </p>
                        <p className="text-xs tabular-nums text-white/45">
                            {safeIndex + 1} / {steps.length}
                        </p>
                    </div>
                    <div
                        className="h-1 overflow-hidden rounded-full bg-white/15"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(progress)}
                        aria-label="Walkthrough progress"
                    >
                        <div
                            className="h-full rounded-full bg-amber-brand transition-[width] duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div
                        ref={chipsRef}
                        className="pointer-carousel -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1"
                    >
                        {steps.map((item, i) => {
                            const active = i === safeIndex
                            const passed = i < safeIndex
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    data-step={i}
                                    onClick={() => setIndex(i)}
                                    aria-current={active ? 'step' : undefined}
                                    className={`snap-center shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] outline-none transition focus-visible:ring-2 focus-visible:ring-white ${
                                        active
                                            ? 'bg-amber-brand text-ink'
                                            : passed
                                              ? 'bg-white/15 text-white/70 hover:bg-white/25'
                                              : 'bg-white/10 text-white/45 hover:bg-white/15 hover:text-white/70'
                                    }`}
                                >
                                    {item.chip}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div
                    key={step.id}
                    className="flex flex-1 flex-col items-center gap-4 animate-buddy-rise sm:flex-row sm:items-end sm:gap-8"
                >
                    <BuddyMascot
                        pose={step.pose}
                        title={`Your local buddy in ${cityName}`}
                        className="h-32 w-auto shrink-0 sm:h-48 lg:h-56"
                    />

                    <div
                        aria-live="polite"
                        className="relative w-full min-w-0 rounded-[1.35rem] border border-white/15 bg-ink/55 p-4 backdrop-blur-md sm:mb-2 sm:rounded-[1.75rem] sm:p-6"
                    >
                        <span
                            aria-hidden="true"
                            className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-white/15 bg-ink/55 sm:left-0 sm:top-auto sm:bottom-8 sm:translate-x-[-50%] sm:translate-y-0 sm:rotate-45 sm:border-b sm:border-l sm:border-t-0"
                        />

                        <p
                            className="font-display text-[1.65rem] leading-tight sm:text-3xl lg:text-4xl"
                            lang={
                                step.id === 'hello' || step.id === 'bye' ? greeting.lang : undefined
                            }
                        >
                            {step.heading}
                        </p>

                        {step.body.filter(Boolean).map((paragraph, i) => (
                            <p
                                key={i}
                                className="mt-3 text-[15px] leading-relaxed text-white/78"
                            >
                                {paragraph}
                            </p>
                        ))}

                        {step.bullets && step.bullets.length > 0 && (
                            <ul className="mt-4 space-y-2.5">
                                {step.bullets.map((bullet, i) => (
                                    <li
                                        key={i}
                                        className="flex gap-3 text-[15px] leading-relaxed text-white/80"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-brand"
                                        />
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                    <div className="flex gap-2 sm:contents">
                        <button
                            type="button"
                            onClick={() => setIndex(safeIndex - 1)}
                            disabled={isFirst}
                            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:ring-2 focus-visible:ring-white sm:flex-none sm:px-5"
                        >
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            Back
                        </button>

                        {isLast ? (
                            <TakeMeThere
                                destination={toCoords(latitude, longitude)}
                                destinationName={name}
                                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-amber-brand px-4 py-2.5 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-white sm:flex-none sm:px-6"
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIndex(safeIndex + 1)}
                                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-amber-brand px-4 py-2.5 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-white sm:flex-none sm:px-6"
                            >
                                {isFirst ? "Let's go in" : 'Then what?'}
                                <ArrowRight className="size-4" aria-hidden="true" />
                            </button>
                        )}
                    </div>

                    {isLast && (
                        <button
                            type="button"
                            onClick={() => setIndex(0)}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white sm:px-5"
                        >
                            <RotateCcw className="size-4" aria-hidden="true" />
                            Tell me again
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}
