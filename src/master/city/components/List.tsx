'use client'

import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { MapPin, Pencil, SearchIcon } from 'lucide-react'
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
import DeleteCityButton from '@/master/city/components/DeleteButton'
import type { city } from '@/master/city/types'

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

function CityList({
    cities,
    pagination,
}: {
    cities: city[]
    pagination?: ReactNode
}) {
    const [query, setQuery] = useState('')
    const [countryFilter, setCountryFilter] = useState('all')

    const countries = useMemo(() => {
        return Array.from(new Set(cities.map((item) => item.country))).sort()
    }, [cities])

    const filteredCities = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        return cities.filter((item) => {
            const matchesCountry = countryFilter === 'all' || item.country === countryFilter

            if (!matchesCountry) {
                return false
            }

            if (!normalizedQuery) {
                return true
            }

            return (
                item.name.toLowerCase().includes(normalizedQuery) ||
                item.code.toLowerCase().includes(normalizedQuery) ||
                item.state.toLowerCase().includes(normalizedQuery) ||
                item.country.toLowerCase().includes(normalizedQuery)
            )
        })
    }, [cities, query, countryFilter])

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
                        aria-label="Filter cities"
                        className="h-8 pl-8"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                        type="button"
                        size="xs"
                        variant={countryFilter === 'all' ? 'secondary' : 'ghost'}
                        aria-pressed={countryFilter === 'all'}
                        onClick={() => setCountryFilter('all')}
                    >
                        All
                    </Button>
                    {countries.map((country) => (
                        <Button
                            key={country}
                            type="button"
                            size="xs"
                            variant={countryFilter === country ? 'secondary' : 'ghost'}
                            aria-pressed={countryFilter === country}
                            onClick={() => setCountryFilter(country)}
                        >
                            {country}
                        </Button>
                    ))}
                    <span className="pl-1 text-xs text-muted-foreground">
                        {filteredCities.length} on this page
                    </span>
                </div>
            </div>

            {filteredCities.length === 0 ? (
                <Empty className="py-14">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <MapPin />
                        </EmptyMedia>
                        <EmptyTitle>No matching cities</EmptyTitle>
                        <EmptyDescription>
                            Clear search or choose a different country.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="h-9 px-4 text-xs">Name</TableHead>
                            <TableHead className="h-9 px-4 text-xs">Code</TableHead>
                            <TableHead className="h-9 px-4 text-xs">State</TableHead>
                            <TableHead className="h-9 px-4 text-xs">Country</TableHead>
                            <TableHead className="h-9 px-4 text-xs">Status</TableHead>
                            <TableHead className="h-9 px-4 text-xs text-right">Updated</TableHead>
                            <TableHead className="h-9 px-4 text-xs text-right">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCities.map((item) => (
                            <TableRow key={item.id} className="group">
                                <TableCell className="px-4 py-2.5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted font-medium text-muted-foreground">
                                            {item.name.slice(0, 1).toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.latitude && item.longitude
                                                    ? `${item.latitude}, ${item.longitude}`
                                                    : `ID ${item.id}`}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-2.5">
                                    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] tracking-wide text-muted-foreground">
                                        {item.code}
                                    </code>
                                </TableCell>
                                <TableCell className="px-4 py-2.5 text-sm">{item.state}</TableCell>
                                <TableCell className="px-4 py-2.5">
                                    <Badge variant="secondary">{item.country}</Badge>
                                </TableCell>
                                <TableCell className="px-4 py-2.5">
                                    <Badge variant={item.is_active ? 'secondary' : 'outline'}>
                                        {item.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-2.5 text-right text-xs text-muted-foreground whitespace-normal">
                                    {formatUpdatedAt(item.updated_at)}
                                </TableCell>
                                <TableCell className="px-4 py-2.5">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link
                                            href={`/city/${item.id}/edit`}
                                            aria-label={`Edit ${item.name}`}
                                            title="Edit"
                                            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-xs' }))}
                                        >
                                            <Pencil />
                                        </Link>
                                        <DeleteCityButton id={item.id} name={item.name} />
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

export default CityList
