'use client'

import { useMemo, useState } from 'react'
import { Landmark, MapPin } from 'lucide-react'

import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { attractions } from '@/features/attractions/types'
import SearchAttractions from '@/features/attractions/components/Search'

function AttractionsList({ attarctionsData }: { attarctionsData: attractions[] }) {
    const [query, setQuery] = useState('')

    const filteredAttractions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        return attarctionsData.filter((attraction) => {
            if (!attraction.name) {
                return false
            }

            if (!normalizedQuery) {
                return true
            }

            return (
                attraction.name.toLowerCase().includes(normalizedQuery) ||
                attraction.formatted.toLowerCase().includes(normalizedQuery)
            )
        })
    }, [attarctionsData, query])

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchAttractions query={query} onQueryChange={setQuery} />
                <p className="text-xs text-muted-foreground">
                    {filteredAttractions.length} of {attarctionsData.length} shown
                </p>
            </div>
            <div>
                {filteredAttractions.length === 0 ? (
                    <Empty className="py-12">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Landmark />
                            </EmptyMedia>
                            <EmptyTitle>No matching attractions</EmptyTitle>
                            <EmptyDescription>
                                Try a different name or address.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="px-4">Name</TableHead>
                                <TableHead className="px-4">Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttractions.map((attraction) => (
                                <TableRow key={attraction.place_id}>
                                    <TableCell className="px-4 font-medium whitespace-normal">
                                        {attraction.name}
                                    </TableCell>
                                    <TableCell className="px-4 text-muted-foreground whitespace-normal">
                                        <span className="inline-flex items-start gap-2">
                                            <MapPin className="mt-0.5 size-3.5 shrink-0" />
                                            {attraction.formatted}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}

export default AttractionsList
