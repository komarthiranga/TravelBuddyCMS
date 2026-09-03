import Link from 'next/link'
import { Landmark, Plus } from 'lucide-react'

import { PageHeader } from '@/components/cms/page-header'
import { Pagination } from '@/components/cms/pagination'
import { buttonVariants } from '@/components/ui/button'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { getAttractions } from '@/master/attraction/api/getAttractions'
import AttractionList from '@/master/attraction/components/List'
import type { attractionListItem } from '@/master/attraction/types'
import { parsePage, parsePageSize } from '@/master/list-pagination'

function toIsoString(value: Date | string) {
    if (value instanceof Date) {
        return value.toISOString()
    }

    return value
}

async function AttractionPage({ searchParams }: PageProps<'/attraction'>) {
    const params = await searchParams
    const { rows, total, page, pageCount, pageSize } = await getAttractions({
        page: parsePage(params.page),
        pageSize: parsePageSize(params.perPage),
    })

    const attractions: attractionListItem[] = rows.map((row) => ({
        id: row.id,
        short_name: row.short_name,
        slug: row.slug,
        city_name: row.city_name,
        category_name: row.category_name,
        status: row.status,
        is_active: row.is_active,
        updated_at: toIsoString(row.updated_at),
    }))

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Content"
                title="Attractions"
                description="Places to visit, linked to a city and category."
                count={total}
                actions={
                    <Link href="/attraction/new" className={cn(buttonVariants())}>
                        <Plus data-icon="inline-start" />
                        Create
                    </Link>
                }
            />

            {total === 0 ? (
                <Empty className="border bg-card py-16 shadow-sm">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Landmark />
                        </EmptyMedia>
                        <EmptyTitle>No attractions yet</EmptyTitle>
                        <EmptyDescription>
                            Create an attraction after you have at least one city and category.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Link href="/attraction/new" className={cn(buttonVariants())}>
                            <Plus data-icon="inline-start" />
                            Create
                        </Link>
                    </EmptyContent>
                </Empty>
            ) : (
                <AttractionList
                    attractions={attractions}
                    pagination={
                        <Pagination
                            basePath="/attraction"
                            page={page}
                            pageCount={pageCount}
                            pageSize={pageSize}
                            total={total}
                        />
                    }
                />
            )}
        </div>
    )
}

export default AttractionPage
