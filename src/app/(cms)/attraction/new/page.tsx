import Link from 'next/link'

import { PageHeader } from '@/components/cms/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCategoriesForSelect } from '@/master/category/api/getCategoriesForSelect'
import { getCitiesForSelect } from '@/master/city/api/getCitiesForSelect'
import AttractionForm from '@/master/attraction/components/Form'

async function NewAttractionPage() {
    const [cities, categories] = await Promise.all([
        getCitiesForSelect(),
        getCategoriesForSelect(),
    ])

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Content"
                title="New attraction"
                description="Link a place to a city and category. Slug must be unique."
                actions={
                    <Link href="/attraction" className={cn(buttonVariants({ variant: 'outline' }))}>
                        Back to list
                    </Link>
                }
            />

            <div className="max-w-3xl overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
                {cities.length === 0 || categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Add at least one city and one category before creating an attraction.
                    </p>
                ) : (
                    <AttractionForm cities={cities} categories={categories} />
                )}
            </div>
        </div>
    )
}

export default NewAttractionPage
