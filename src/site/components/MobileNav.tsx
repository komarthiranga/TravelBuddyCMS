'use client'

import Link from 'next/link'
import { Fragment } from 'react'
import { SavedPlacesButton } from './SavedPlaces'
import { usePathname } from 'next/navigation'
import { Compass, LifeBuoy, Route } from 'lucide-react'

import { useChrome } from '@/site/components/locale-provider'

export function MobileNav() {
    const pathname = usePathname()
    const { t, locale } = useChrome()

    const items = [
        {
            href: '/',
            label: t.explore,
            icon: Compass,
            match: (path: string) => path === '/' || path.startsWith('/attractions') || path === '/food' || path === '/hotels' || path === '/transport',
        },
        { href: '/guide', label: locale === 'te' ? 'ప్రయాణం' : 'Guide', icon: Route, match: (path: string) => path === '/guide' },
        { href: '/help', label: t.help, icon: LifeBuoy, match: (path: string) => path === '/help' },
    ]

    return (
        <nav
            aria-label="Mobile"
            lang={locale}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        >
            <ul className="mx-auto grid max-w-lg grid-cols-4">
                {items.map((item) => {
                    const active = item.match(pathname)
                    return (
                        <Fragment key={item.href}>
                        {item.href === "/help" && <li><SavedPlacesButton mobile /></li>}
                        <li>
                            <Link
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
                                    active ? 'bg-teal-wash text-teal-brand-dark border-t-2 border-teal-brand' : 'text-ink-soft border-t-2 border-transparent'
                                }`}
                            >
                                <item.icon className="size-5" aria-hidden="true" />
                                {item.label}
                            </Link>
                        </li>
                        </Fragment>
                    )
                })}
            </ul>
        </nav>
    )
}
