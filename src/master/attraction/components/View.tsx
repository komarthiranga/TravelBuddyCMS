import Link from 'next/link'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { attraction } from '@/master/attraction/types'
import DeleteAttractionButton from '@/master/attraction/components/DeleteButton'

function Detail({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {label}
            </p>
            <div className="text-sm whitespace-pre-wrap">{children || '—'}</div>
        </div>
    )
}

function AttractionView({ attraction }: { attraction: attraction }) {
    return (
        <div className="space-y-6 overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <h2 className="font-heading text-lg font-semibold">{attraction.short_name}</h2>
                    <p className="text-sm text-muted-foreground">{attraction.full_name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={attraction.status === 'PUBLISHED' ? 'secondary' : 'outline'}>
                        {attraction.status}
                    </Badge>
                    <Badge variant={attraction.is_active ? 'secondary' : 'outline'}>
                        {attraction.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Link
                        href={`/attraction/${attraction.id}/edit`}
                        className={cn(buttonVariants({ size: 'sm' }))}
                    >
                        Edit
                    </Link>
                    <DeleteAttractionButton id={attraction.id} name={attraction.short_name} />
                </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <Detail label="Slug">{attraction.slug}</Detail>
                <Detail label="Category">{attraction.category_name}</Detail>
                <Detail label="City">{attraction.city_name}</Detail>
                <Detail label="Entry fee">
                    {attraction.entry_fee} {attraction.currency_code}
                </Detail>
                <Detail label="Opening">{attraction.opening_time}</Detail>
                <Detail label="Closing">{attraction.closing_time}</Detail>
                <Detail label="Best time to visit">{attraction.best_time_to_visit}</Detail>
                <Detail label="Travel modes">
                    {attraction.travel_modes.length ? attraction.travel_modes.join(', ') : '—'}
                </Detail>
                <Detail label="Coordinates">
                    {attraction.latitude && attraction.longitude
                        ? `${attraction.latitude}, ${attraction.longitude}`
                        : '—'}
                </Detail>
            </div>

            <Detail label="Address">{attraction.address}</Detail>
            <Detail label="Short description">{attraction.short_description}</Detail>
            <Detail label="Full description">{attraction.full_description}</Detail>
            <Detail label="Instructions">{attraction.instructions}</Detail>
        </div>
    )
}

export default AttractionView
