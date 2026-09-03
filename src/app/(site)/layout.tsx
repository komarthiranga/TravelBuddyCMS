import Link from 'next/link'

import { BuddyMark } from '@/site/components/BuddyMark'
import { LocationProvider } from '@/site/components/location-provider'

const NAV_LINKS = [
    { href: '/attractions', label: 'Every place' },
    { href: '/#soon', label: "What's next" },
]

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <LocationProvider>
            <div className="flex min-h-full flex-col bg-cream text-ink">
                <a
                    href="#main"
                    className="sr-only rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100]"
                >
                    Skip to main content
                </a>

                <header className="sticky top-0 z-50 border-b border-hairline/70 bg-cream/80 backdrop-blur-xl">
                    <nav
                        aria-label="Main"
                        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8"
                    >
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                        >
                            <BuddyMark size="sm" />
                            <span className="font-display text-lg tracking-tight">
                                Travel<span className="text-amber-brand-dark">Buddy</span>
                            </span>
                        </Link>

                        <ul className="hidden items-center gap-1 md:flex">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft/80 outline-none transition-colors hover:bg-white hover:text-ink focus-visible:ring-2 focus-visible:ring-teal-brand"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/"
                            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                        >
                            Take my hand
                        </Link>
                    </nav>
                </header>

                <main id="main" className="flex-1">
                    {children}
                </main>

                <footer className="mt-8 border-t border-hairline bg-ink text-white">
                    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <BuddyMark />
                                <span className="font-display text-xl">
                                    Travel<span className="text-amber-brand">Buddy</span>
                                </span>
                            </div>
                            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
                                A local friend in your pocket — directions, the good places, and
                                eventually eats, stays and help when you need it.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
                                Walk with me
                            </h2>
                            <ul className="mt-4 space-y-2.5">
                                {NAV_LINKS.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/65 outline-none transition-colors hover:text-white focus-visible:underline"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
                                Coming next
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-white/55">
                                Restaurants, places to stay, and emergency contacts — so I can cover
                                a full day out, not just the sightseeing.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-white/10">
                        <p className="mx-auto w-full max-w-6xl px-5 py-6 text-xs text-white/35 sm:px-8">
                            © {new Date().getFullYear()} TravelBuddy
                        </p>
                    </div>
                </footer>
            </div>
        </LocationProvider>
    )
}
