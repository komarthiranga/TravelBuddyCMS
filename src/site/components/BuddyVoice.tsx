import type { ReactNode } from 'react'

import { BuddyMark } from '@/site/components/BuddyMark'

/** A conversational line from your local buddy. */
export function BuddySay({
    children,
    tone = 'day',
    className = '',
    /** Drop the small avatar chip when the full character already stands alongside. */
    showMark = true,
}: {
    children: ReactNode
    tone?: 'day' | 'night' | 'whisper'
    className?: string
    showMark?: boolean
}) {
    const shell =
        tone === 'night'
            ? 'bg-white/12 text-white border-white/20 backdrop-blur-md'
            : tone === 'whisper'
              ? 'bg-amber-brand/12 text-ink border-amber-brand/25'
              : 'bg-white text-ink border-hairline shadow-card'

    return (
        <div className={`flex items-start gap-3 ${className}`}>
            {showMark && <BuddyMark size="sm" className="mt-1" />}
            <div className={`relative max-w-2xl rounded-2xl rounded-tl-md border px-4 py-3 ${shell}`}>
                <span
                    aria-hidden="true"
                    className={`absolute -left-1.5 top-3 size-3 rotate-45 border-b border-l ${
                        tone === 'night'
                            ? 'border-white/20 bg-white/12'
                            : tone === 'whisper'
                              ? 'border-amber-brand/25 bg-amber-brand/12'
                              : 'border-hairline bg-white'
                    }`}
                />
                <p className="relative text-[15px] leading-relaxed">{children}</p>
            </div>
        </div>
    )
}

/** Numbered chapter on the “walk with me” path. */
export function WalkChapter({
    step,
    title,
    aside,
    children,
    last = false,
}: {
    step: number
    title: string
    aside?: string
    children: ReactNode
    last?: boolean
}) {
    return (
        <section className="relative grid gap-6 pl-2 sm:grid-cols-[3.5rem_1fr] sm:gap-8 sm:pl-0">
            <div className="relative hidden sm:flex sm:flex-col sm:items-center">
                <span className="z-10 flex size-12 items-center justify-center rounded-full bg-ink font-display text-lg text-white">
                    {step}
                </span>
                {!last && (
                    <span
                        aria-hidden="true"
                        className="walk-path-line mt-2 w-px flex-1 bg-gradient-to-b from-ink via-amber-brand/50 to-transparent"
                    />
                )}
            </div>

            <div className="min-w-0 pb-14 sm:pb-16">
                <div className="mb-4 flex items-center gap-3 sm:hidden">
                    <span className="flex size-9 items-center justify-center rounded-full bg-ink font-display text-sm text-white">
                        {step}
                    </span>
                    {aside && (
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-brand">
                            {aside}
                        </span>
                    )}
                </div>
                {aside && (
                    <p className="mb-2 hidden text-xs font-semibold uppercase tracking-[0.18em] text-teal-brand sm:block">
                        {aside}
                    </p>
                )}
                <h2 className="font-display text-3xl leading-tight text-ink sm:text-[2.15rem]">
                    {title}
                </h2>
                <div className="mt-5">{children}</div>
            </div>
        </section>
    )
}
