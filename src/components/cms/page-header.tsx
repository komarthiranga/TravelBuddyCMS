import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

type PageHeaderProps = {
    eyebrow: string
    title: string
    description: string
    count?: number
    actions?: ReactNode
}

export function PageHeader({
    eyebrow,
    title,
    description,
    count,
    actions,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
                <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                    {eyebrow}
                </p>
                <div className="flex items-center gap-2">
                    <h1 className="font-heading text-xl font-semibold tracking-tight">{title}</h1>
                    {typeof count === 'number' ? (
                        <Badge variant="secondary">{count}</Badge>
                    ) : null}
                </div>
                <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
    )
}
