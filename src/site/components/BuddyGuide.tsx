'use client'

import { useMemo, useState } from 'react'
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

    return (
        <section
            aria-labelledby="buddy-guide-heading"
            className="relative isolate overflow-hidden rounded-[2rem] border border-hairline bg-ink text-white"
        >
            <h2 id="buddy-guide-heading" className="sr-only">
                A guided walk through {name} with your local buddy
            </h2>

            {/* Backdrop: crossfades as the buddy moves you through */}
            <div aria-hidden="true" className="absolute inset-0">
                {images.length > 0 ? (
                    images.map((image, i) => (
                        <Image
                            key={image.url}
                            src={image.url}
                            alt=""
                            fill
                            sizes="(max-width: 1024px) 100vw, 900px"
                            className={`object-cover transition-opacity duration-700 ${
                                i === step.imageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                    ))
                ) : (
                    <div className="size-full grain" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/45" />
            </div>

            <div className="relative flex min-h-[34rem] flex-col justify-between gap-8 p-6 sm:p-9">
                {/* Progress */}
                <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-brand">
                        {step.chip}
                    </p>
                    <p className="text-xs text-white/45">
                        Step {safeIndex + 1} of {steps.length}
                    </p>
                </div>

                {/* Buddy + speech */}
                <div className="flex items-end gap-4 sm:gap-6">
                    <BuddyMascot
                        pose={step.pose}
                        title={`Your local buddy in ${cityName}`}
                        className="h-40 w-auto shrink-0 sm:h-52"
                    />

                    <div
                        aria-live="polite"
                        className="relative mb-4 flex-1 rounded-3xl rounded-bl-md border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:p-6"
                    >
                        <span
                            aria-hidden="true"
                            className="absolute -left-1.5 bottom-4 size-3 rotate-45 border-b border-l border-white/15 bg-white/10"
                        />

                        <p
                            className="font-display text-2xl leading-tight sm:text-3xl"
                            lang={
                                step.id === 'hello' || step.id === 'bye' ? greeting.lang : undefined
                            }
                        >
                            {step.heading}
                        </p>

                        {step.body
                            .filter(Boolean)
                            .map((paragraph, i) => (
                                <p
                                    key={i}
                                    className="mt-3 text-[15px] leading-relaxed text-white/75"
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

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIndex(safeIndex - 1)}
                        disabled={isFirst}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:ring-2 focus-visible:ring-white"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Back
                    </button>

                    {isLast ? (
                        <>
                            <TakeMeThere
                                destination={toCoords(latitude, longitude)}
                                destinationName={name}
                                className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-6 py-2.5 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-white"
                            />
                            <button
                                type="button"
                                onClick={() => setIndex(0)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <RotateCcw className="size-4" aria-hidden="true" />
                                Tell me again
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIndex(safeIndex + 1)}
                            className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-6 py-2.5 text-sm font-semibold text-ink outline-none transition hover:bg-amber-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                        >
                            {isFirst ? "Let's go in" : 'Then what?'}
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    )}

                    <ol className="ml-auto flex items-center gap-1.5">
                        {steps.map((item, i) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    onClick={() => setIndex(i)}
                                    aria-current={i === safeIndex ? 'step' : undefined}
                                    aria-label={`Step ${i + 1}: ${item.chip}`}
                                    className={`block h-1.5 rounded-full outline-none transition-all focus-visible:ring-2 focus-visible:ring-white ${
                                        i === safeIndex
                                            ? 'w-6 bg-amber-brand'
                                            : 'w-1.5 bg-white/30 hover:bg-white/60'
                                    }`}
                                />
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    )
}
