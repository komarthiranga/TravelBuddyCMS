import Link from 'next/link'
import { MapPin, Plus } from 'lucide-react'

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
import { getCities } from '@/master/city/api/getCities'
import CityList from '@/master/city/components/List'
import type { city } from '@/master/city/types'
import { parsePage, parsePageSize } from '@/master/list-pagination'

function toIsoString(value: Date | string) {
    if (value instanceof Date) {
        return value.toISOString()
    }

    return value
}

async function CityPage({ searchParams }: PageProps<'/city'>) {
    const params = await searchParams
    const { rows, total, page, pageCount, pageSize } = await getCities({
        page: parsePage(params.page),
        pageSize: parsePageSize(params.perPage),
    })

    const cities: city[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        state: row.state,
        country: row.country,
        latitude: row.latitude,
        longitude: row.longitude,
        is_active: row.is_active,
        created_at: toIsoString(row.created_at),
        updated_at: toIsoString(row.updated_at),
    }))

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Master data"
                title="Cities"
                description="Places used to locate travel content."
                count={total}
                actions={
                    <Link href="/city/new" className={cn(buttonVariants())}>
                        <Plus data-icon="inline-start" />
                        Create
                    </Link>
                }
            />

            {total === 0 ? (
                <Empty className="border bg-card py-16 shadow-sm">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <MapPin />
                        </EmptyMedia>
                        <EmptyTitle>No cities yet</EmptyTitle>
                        <EmptyDescription>
                            Add a city with name, code, state, and country.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Link href="/city/new" className={cn(buttonVariants())}>
                            <Plus data-icon="inline-start" />
                            Create
                        </Link>
                    </EmptyContent>
                </Empty>
            ) : (
                <CityList
                    cities={cities}
                    pagination={
                        <Pagination
                            basePath="/city"
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

export default CityPage
