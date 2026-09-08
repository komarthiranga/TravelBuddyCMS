import Link from 'next/link'
import { LifeBuoy, Phone } from 'lucide-react'

import { BuddyMascot } from '@/site/components/BuddyMascot'

export const metadata = {
    title: 'Help — TravelBuddy',
    description: 'How TravelBuddy works, and what to do in an emergency.',
}

export default function HelpPage() {
    return (
        <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8">
            <div className="flex items-start gap-4">
                <BuddyMascot pose="wave" title="Your local buddy" className="h-24 w-auto shrink-0" />
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-brand-dark">
                        Help
                    </p>
                    <h1 className="mt-2 font-display text-4xl leading-tight text-ink">
                        Ask like you would ask a local
                    </h1>
                    <p className="mt-3 text-lg leading-relaxed text-ink-soft">
                        Pick what you need — a place to see, food, a hotel, transport, or
                        emergency help. I show the useful facts first, then directions.
                    </p>
                </div>
            </div>

            <div className="mt-10 rounded-3xl border-2 border-ink bg-white p-6">
                <p className="flex items-center gap-2 text-lg font-semibold text-ink">
                    <LifeBuoy className="size-5" aria-hidden="true" />
                    Emergency
                </p>
                <p className="mt-2 text-base text-ink-soft">
                    If someone is hurt or in danger, call 112. Do not wait for this app.
                </p>
                <a
                    href="tel:112"
                    className="mt-5 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-ink px-8 text-lg font-semibold text-white outline-none hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand"
                >
                    <Phone className="size-5" aria-hidden="true" />
                    Call 112
                </a>
                <Link
                    href="/emergency"
                    className="mt-4 block text-base font-semibold text-ink underline-offset-4 hover:underline"
                >
                    More emergency help
                </Link>
            </div>

            <ol className="mt-10 space-y-4 text-base leading-relaxed text-ink-soft">
                <li>
                    <strong className="text-ink">1. Choose a starting point.</strong> Use your
                    location, or start from the city centre so distances stay honest.
                </li>
                <li>
                    <strong className="text-ink">2. Pick a category.</strong> Attractions are live.
                    Food, hotels and local transport are coming next.
                </li>
                <li>
                    <strong className="text-ink">3. Open a place.</strong> You will see hours, fee,
                    why to visit, and Get directions — which opens Google Maps.
                </li>
            </ol>
        </div>
    )
}
