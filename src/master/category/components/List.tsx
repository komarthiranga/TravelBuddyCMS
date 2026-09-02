'use client'

import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { Pencil, SearchIcon, Tags } from 'lucide-react'
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
import DeleteCategoryButton from '@/master/category/components/DeleteButton'
import type { category } from '@/master/category/types'

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

function CategoryList({
    categories,
    pagination,
}: {
    categories: category[]
    pagination?: ReactNode
}) {
    const [query, setQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')

    const types = useMemo(() => {
        return Array.from(new Set(categories.map((item) => item.category_type))).sort()
    }, [categories])

    const filteredCategories = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        return categories.filter((item) => {
            const matchesType = typeFilter === 'all' || item.category_type === typeFilter

            if (!matchesType) {
                return false
            }

            if (!normalizedQuery) {
                return true
            }

            return (
                item.name.toLowerCase().includes(normalizedQuery) ||
                item.category_type.toLowerCase().includes(normalizedQuery) ||
                item.code.toLowerCase().includes(normalizedQuery)
            )
        })
    }, [categories, query, typeFilter])

    const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="Filter this page..."
                        aria-label="Filter categories"
                        className="h-8 pl-8"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                        type="button"
                        size="xs"
                        variant={typeFilter === 'all' ? 'secondary' : 'ghost'}
                        aria-pressed={typeFilter === 'all'}
                        onClick={() => setTypeFilter('all')}
                    >
                        All
                    </Button>
                    {types.map((type) => (
                        <Button
                            key={type}
                            type="button"
                            size="xs"
                            variant={typeFilter === type ? 'secondary' : 'ghost'}
                            aria-pressed={typeFilter === type}
                            onClick={() => setTypeFilter(type)}
                        >
                            {type}
                        </Button>
                    ))}
                    <span className="pl-1 text-xs text-muted-foreground">
                        {filteredCategories.length} on this page
                    </span>
                </div>
            </div>

            {filteredCategories.length === 0 ? (
                <Empty className="py-14">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Tags />
                        </EmptyMedia>
                        <EmptyTitle>No matching categories</EmptyTitle>
                        <EmptyDescription>
                            Clear search or choose a different type.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="h-9 px-4 text-xs">Name</TableHead>
                            <TableHead className="h-9 px-4 text-xs">Type</TableHead>
                            <TableHead className="h-9 px-4 text-xs">Code</TableHead>
                            <TableHead className="h-9 px-4 text-xs text-right">Updated</TableHead>
                            <TableHead className="h-9 px-4 text-xs text-right">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCategories.map((item) => (
                            <TableRow key={item.id} className="group">
                                <TableCell className="px-4 py-2.5">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                'flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted font-medium text-muted-foreground'
                                            )}
                                            aria-hidden
                                        >
                                            {item.name.slice(0, 1).toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">ID {item.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-2.5">
                                    <Badge variant="secondary">{item.category_type}</Badge>
                                </TableCell>
                                <TableCell className="px-4 py-2.5">
                                    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] tracking-wide text-muted-foreground">
                                        {item.code}
                                    </code>
                                </TableCell>
                                <TableCell className="px-4 py-2.5 text-right text-xs text-muted-foreground whitespace-normal">
                                    {formatUpdatedAt(item.updated_at)}
                                </TableCell>
                                <TableCell className="px-4 py-2.5">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link
                                            href={`/category/${item.id}/edit`}
                                            aria-label={`Edit ${item.name}`}
                                            title="Edit"
                                            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-xs' }))}
                                        >
                                            <Pencil />
                                        </Link>
                                        <DeleteCategoryButton id={item.id} name={item.name} />
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

export default CategoryList
