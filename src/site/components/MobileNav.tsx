'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, House, LifeBuoy } from 'lucide-react'

import { useChrome } from '@/site/components/locale-provider'

export function MobileNav() {
    const pathname = usePathname()
    const { t } = useChrome()

    const items = [
        { href: '/', label: t.home, icon: House, match: (path: string) => path === '/' },
        {
            href: '/attractions',
            label: t.explore,
            icon: Compass,
            match: (path: string) => path.startsWith('/attractions'),
        },
        { href: '/help', label: t.help, icon: LifeBuoy, match: (path: string) => path === '/help' },
    ]

    return (
        <nav
            aria-label="Mobile"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        >
            <ul className="mx-auto grid max-w-lg grid-cols-3">
                {items.map((item) => {
                    const active = item.match(pathname)
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-teal-brand ${
                                    active ? 'text-ink' : 'text-ink-soft'
                                }`}
                            >
                                <item.icon className="size-5" aria-hidden="true" />
                                {item.label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
