import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, Phone } from 'lucide-react'

import { BuddyMascot } from '@/site/components/BuddyMascot'

export function ComingSoonPage({
    title,
    summary,
    icon: Icon,
    emergency = false,
}: {
    title: string
    summary: string
    icon: LucideIcon
    emergency?: boolean
}) {
    return (
        <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8">
            <Link
                href="/"
                className="inline-flex min-h-12 items-center gap-2 rounded-full text-base font-semibold text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-teal-brand"
            >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Home
            </Link>

            <div className="mt-8 flex items-start gap-4">
                <BuddyMascot pose="talk" title="Your local buddy" className="h-24 w-auto shrink-0" />
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-brand-dark">
                        Coming soon
                    </p>
                    <h1 className="mt-2 font-display text-4xl leading-tight text-ink">{title}</h1>
                    <p className="mt-3 text-lg leading-relaxed text-ink-soft">{summary}</p>
                </div>
            </div>

            {emergency && (
                <div className="mt-10 rounded-3xl border-2 border-ink bg-white p-6">
                    <p className="text-lg font-semibold text-ink">
                        If you need help right now, call 112.
                    </p>
                    <a
                        href="tel:112"
                        className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-lg font-semibold text-white outline-none hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand sm:w-auto sm:px-8"
                    >
                        <Phone className="size-5" aria-hidden="true" />
                        Call 112
                    </a>
                    <p className="mt-4 text-base text-ink-soft">
                        Police, fire and ambulance. Available across India. Local hospital and
                        pharmacy numbers will appear here once I have verified them.
                    </p>
                </div>
            )}

            <p className="mt-10 inline-flex items-center gap-2 rounded-2xl border border-dashed border-hairline bg-white px-4 py-3 text-base text-ink-soft">
                <Icon className="size-5 text-teal-brand-dark" aria-hidden="true" />
                I only list a place when I would send my own family there.
            </p>
        </div>
    )
}
