'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Tags } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const masterLinks = [
    { href: '/category', label: 'Categories', icon: Tags },
]

function NavLink({
    href,
    label,
    icon: Icon,
}: {
    href: string
    label: string
    icon: typeof Tags
}) {
    const pathname = usePathname()
    const isActive = pathname === href || pathname.startsWith(`${href}/`)

    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
            )}
        >
            <Icon className="size-4 shrink-0" />
            {label}
        </Link>
    )
}

function NavGroup({
    title,
    children,
}: {
    title: string
    children: ReactNode
}) {
    return (
        <div className="space-y-1">
            <p className="px-2.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {title}
            </p>
            <div className="space-y-0.5">{children}</div>
        </div>
    )
}

export function SidebarNav() {
    return (
        <aside className="flex w-full shrink-0 flex-col border-b bg-sidebar md:sticky md:top-0 md:h-svh md:w-60 md:border-r md:border-b-0">
            <div className="flex h-14 shrink-0 items-center gap-2.5 border-b px-4">
                <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
                    <Compass className="size-3.5" />
                </span>
                <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold tracking-tight">Travel Buddy</p>
                    <p className="text-[11px] text-muted-foreground">Content admin</p>
                </div>
            </div>

            <nav className="flex gap-4 overflow-x-auto px-3 py-3 md:min-h-0 md:flex-1 md:flex-col md:gap-6 md:overflow-y-auto">
                <NavGroup title="Master data">
                    {masterLinks.map((item) => (
                        <NavLink key={item.href} {...item} />
                    ))}
                </NavGroup>
            </nav>

            <div className="mt-auto hidden shrink-0 border-t px-4 py-3 md:block">
                <p className="text-[11px] font-medium text-muted-foreground">Workspace</p>
                <p className="mt-0.5 truncate text-xs text-sidebar-foreground">travel_buddy · local</p>
            </div>
        </aside>
    )
}
