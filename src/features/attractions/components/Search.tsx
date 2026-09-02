'use client'

import { SearchIcon } from 'lucide-react'
import { type ChangeEvent } from 'react'

import { Input } from '@/components/ui/input'

type SearchAttractionsProps = {
    query: string
    onQueryChange: (value: string) => void
}

function SearchAttractions({ query, onQueryChange }: SearchAttractionsProps) {
    const handleSearchAttractions = (event: ChangeEvent<HTMLInputElement>) => {
        onQueryChange(event.target.value)
    }

    return (
        <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                value={query}
                onChange={handleSearchAttractions}
                placeholder="Search attractions..."
                aria-label="Search attractions"
                className="pl-8"
            />
        </div>
    )
}

export default SearchAttractions
