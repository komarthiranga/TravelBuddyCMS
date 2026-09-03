'use client'

import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { Eye, Landmark, Pencil, SearchIcon } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import DeleteAttractionButton from '@/master/attraction/components/DeleteButton'
import type { attractionListItem } from '@/master/attraction/types'

function formatUpdatedAt(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return '—'
    }

    return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

function AttractionList({
    attractions,
    pagination,
}: {
    attractions: attractionListItem[]
    pagination?: ReactNode
}) {
    const [query, setQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const statuses = useMemo(() => {
        return Array.from(new Set(attractions.map((item) => item.status))).sort()
    }, [attractions])

    const filteredAttractions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        return attractions.filter((item) => {
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter

            if (!matchesStatus) {
                return false
            }

            if (!normalizedQuery) {
                return true
            }

            return (
                item.short_name.toLowerCase().includes(normalizedQuery) ||
                item.slug.toLowerCase().includes(normalizedQuery) ||
                item.city_name.toLowerCase().includes(normalizedQuery) ||
                item.category_name.toLowerCase().includes(normalizedQuery)
            )
        })
    }, [attractions, query, statusFilter])

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={query}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                        placeholder="Filter this page..."
                        aria-label="Filter attractions"
                        className="h-8 pl-8"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                        type="button"
                        size="xs"
                        variant={statusFilter === 'all' ? 'secondary' : 'ghost'}
                        aria-pressed={statusFilter === 'all'}
                        onClick={() => setStatusFilter('all')}
                    >
                        All
                    </Button>
                    {statuses.map((status) => (
                        <Button
                            key={status}
                            type="button"
                            size="xs"
                            variant={statusFilter === status ? 'secondary' : 'ghost'}
                            aria-pressed={statusFilter === status}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </Button>
                    ))}
                    <span className="pl-1 text-xs text-muted-foreground">
                        {filteredAttractions.length} on this page
                    </span>
                </div>
            </div>

            {filteredAttractions.length === 0 ? (
                <Empty className="py-14">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Landmark />
                        </EmptyMedia>
                        <EmptyTitle>No matching attractions</EmptyTitle>
                        <EmptyDescription>
                            Clear search or choose a different status.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="h-9 px-4 text-xs">Name</TableHead>
                            <TableHead className="h-9 px-4 text-xs">City</TableHead>
                            <TableHead className="h-9 px-4 text-xs">Category</TableHead>
                            <TableHead className="h-9 px-4 text-xs">Status</TableHead>
                            <TableHead className="h-9 px-4 text-xs text-right">Updated</TableHead>
                            <TableHead className="h-9 px-4 text-xs text-right">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAttractions.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="px-4 py-2.5">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{item.short_name}</p>
                                        <p className="truncate font-mono text-xs text-muted-foreground">
                                            {item.slug}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-2.5 text-sm">{item.city_name}</TableCell>
                                <TableCell className="px-4 py-2.5">
                                    <Badge variant="secondary">{item.category_name}</Badge>
                                </TableCell>
                                <TableCell className="px-4 py-2.5">
                                    <div className="flex flex-col items-start gap-1">
                                        <Badge variant={item.status === 'PUBLISHED' ? 'secondary' : 'outline'}>
                                            {item.status}
                                        </Badge>
                                        {!item.is_active ? (
                                            <span className="text-[11px] text-muted-foreground">Inactive</span>
                                        ) : null}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-2.5 text-right text-xs text-muted-foreground whitespace-normal">
                                    {formatUpdatedAt(item.updated_at)}
                                </TableCell>
                                <TableCell className="px-4 py-2.5">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link
                                            href={`/attraction/${item.id}`}
                                            aria-label={`View ${item.short_name}`}
                                            title="View"
                                            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-xs' }))}
                                        >
                                            <Eye />
                                        </Link>
                                        <Link
                                            href={`/attraction/${item.id}/edit`}
                                            aria-label={`Edit ${item.short_name}`}
                                            title="Edit"
                                            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-xs' }))}
                                        >
                                            <Pencil />
                                        </Link>
                                        <DeleteAttractionButton id={item.id} name={item.short_name} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {pagination}
        </div>
    )
}

export default AttractionList
