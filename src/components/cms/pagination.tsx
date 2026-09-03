'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ChangeEvent } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    MASTER_PAGE_SIZES,
    masterListPath,
} from '@/master/list-pagination'

type PaginationProps = {
    basePath: string
    page: number
    pageCount: number
    pageSize: number
    total: number
}

export function Pagination({
    basePath,
    page,
    pageCount,
    pageSize,
    total,
}: PaginationProps) {
    const router = useRouter()

    if (total === 0) {
        return null
    }

    const previousPage = page > 1 ? page - 1 : null
    const nextPage = page < pageCount ? page + 1 : null

    const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        router.push(masterListPath(basePath, 1, Number(event.target.value)))
    }

    return (
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs text-muted-foreground">
                    Page {page} of {pageCount}
                </p>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Per page
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        aria-label="Rows per page"
                        className="h-7 rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        {MASTER_PAGE_SIZES.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="flex items-center gap-1.5">
                <Link
                    href={
                        previousPage
                            ? masterListPath(basePath, previousPage, pageSize)
                            : masterListPath(basePath, 1, pageSize)
                    }
                    aria-disabled={!previousPage}
                    tabIndex={previousPage ? undefined : -1}
                    className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        !previousPage && 'pointer-events-none opacity-50'
                    )}
                >
                    <ChevronLeft data-icon="inline-start" />
                    Previous
                </Link>
                <Link
                    href={
                        nextPage
                            ? masterListPath(basePath, nextPage, pageSize)
                            : masterListPath(basePath, page, pageSize)
                    }
                    aria-disabled={!nextPage}
                    tabIndex={nextPage ? undefined : -1}
                    className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        !nextPage && 'pointer-events-none opacity-50'
                    )}
                >
                    Next
                    <ChevronRight data-icon="inline-end" />
                </Link>
            </div>
        </div>
    )
}
