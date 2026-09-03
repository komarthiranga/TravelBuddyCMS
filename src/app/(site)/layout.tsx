import Link from 'next/link'
import { Compass } from 'lucide-react'

const NAV_LINKS = [
    { href: '/attractions', label: 'Attractions' },
    { href: '/#destinations', label: 'Destinations' },
    { href: '/#categories', label: 'Categories' },
]

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
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
                        <span className="flex size-8 items-center justify-center rounded-xl bg-ink text-white">
                            <Compass className="size-4" aria-hidden="true" />
                        </span>
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
                        href="/attractions"
                        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-ink-soft focus-visible:ring-2 focus-visible:ring-teal-brand focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                    >
                        Start exploring
                    </Link>
                </nav>
            </header>

            <main id="main" className="flex-1">
                {children}
            </main>

            <footer className="mt-24 border-t border-hairline bg-white">
                <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-ink text-white">
                                <Compass className="size-4" aria-hidden="true" />
                            </span>
                            <span className="font-display text-lg">
                                Travel<span className="text-amber-brand-dark">Buddy</span>
                            </span>
                        </div>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft/70">
                            A quiet, carefully kept guide to the places worth the detour — with the
                            practical details you actually need before you go.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-soft/50">
                            Explore
                        </h2>
                        <ul className="mt-4 space-y-2.5">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-ink-soft/75 outline-none transition-colors hover:text-ink focus-visible:underline"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-soft/50">
                            Coverage
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-ink-soft/70">
                            Destinations across Andhra Pradesh and beyond, updated as new places are
                            published.
                        </p>
                    </div>
                </div>

                <div className="border-t border-hairline">
                    <p className="mx-auto w-full max-w-6xl px-5 py-6 text-xs text-ink-soft/50 sm:px-8">
                        © {new Date().getFullYear()} TravelBuddy
                    </p>
                </div>
            </footer>
        </div>
    )
}
