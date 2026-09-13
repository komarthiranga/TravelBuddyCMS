'use client'

import { useState } from 'react'
import { Headphones } from 'lucide-react'

import dynamic from 'next/dynamic'
const BuddyGuide = dynamic(() => import('@/site/components/BuddyGuide').then(module => module.BuddyGuide))
import type { Greeting } from '@/site/lib/greetings'

export function GuidedTour(props: {
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
    images: { url: string; alt: string }[]
}) {
    const [open, setOpen] = useState(false)

    return (
        <div className="mt-10">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-base font-semibold text-white outline-none hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand"
            >
                <Headphones className="size-4" aria-hidden="true" />
                {open ? "Hide Buddy's guided tour" : "Listen to the guide (English)"}
            </button>
            {open && (
                <div className="mt-6">
                    <BuddyGuide {...props} />
                </div>
            )}
        </div>
    )
}
