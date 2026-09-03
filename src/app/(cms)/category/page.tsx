import Link from 'next/link'
import { Plus, Tags } from 'lucide-react'

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
import { getCategories } from '@/master/category/api/getCategories'
import CategoryList from '@/master/category/components/List'
import { parseCategoryPage, parseCategoryPageSize } from '@/master/category/pagination'
import type { category } from '@/master/category/types'

function toIsoString(value: Date | string) {
    if (value instanceof Date) {
        return value.toISOString()
    }

    return value
}

async function CategoryPage({
    searchParams,
}: PageProps<'/category'>) {
    const params = await searchParams
    const { rows, total, page, pageCount, pageSize } = await getCategories({
        page: parseCategoryPage(params.page),
        pageSize: parseCategoryPageSize(params.perPage),
    })

    const categories: category[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        category_type: row.category_type,
        code: row.code,
        created_at: toIsoString(row.created_at),
        updated_at: toIsoString(row.updated_at),
    }))

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Master data"
                title="Categories"
                description="Shared labels for grouping travel records."
                count={total}
                actions={
                    <Link href="/category/new" className={cn(buttonVariants())}>
                        <Plus data-icon="inline-start" />
                        Create
                    </Link>
                }
            />

            {total === 0 ? (
                <Empty className="border bg-card py-16 shadow-sm">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Tags />
                        </EmptyMedia>
                        <EmptyTitle>No categories yet</EmptyTitle>
                        <EmptyDescription>
                            Create a category to start grouping travel content.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Link href="/category/new" className={cn(buttonVariants())}>
                            <Plus data-icon="inline-start" />
                            Create
                        </Link>
                    </EmptyContent>
                </Empty>
            ) : (
                <CategoryList
                    categories={categories}
                    pagination={
                        <Pagination
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

export default CategoryPage
