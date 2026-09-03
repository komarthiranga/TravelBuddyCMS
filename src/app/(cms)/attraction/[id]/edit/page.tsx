import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/cms/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAttractionById } from '@/master/attraction/api/getAttractionById'
import AttractionForm from '@/master/attraction/components/Form'
import DeleteAttractionButton from '@/master/attraction/components/DeleteButton'
import { parseAttractionId } from '@/master/attraction/ids'
import { serializeAttraction, toTimeInput } from '@/master/attraction/serialize'
import { getCategoriesForSelect } from '@/master/category/api/getCategoriesForSelect'
import { getCitiesForSelect } from '@/master/city/api/getCitiesForSelect'

async function EditAttractionPage({ params }: PageProps<'/attraction/[id]/edit'>) {
    const { id: rawId } = await params
    const id = parseAttractionId(rawId)

    if (!id) {
        notFound()
    }

    const [row, cities, categories] = await Promise.all([
        getAttractionById(id),
        getCitiesForSelect(),
        getCategoriesForSelect(),
    ])

    if (!row) {
        notFound()
    }

    const attraction = serializeAttraction(row)

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Content"
                title={`Edit ${attraction.short_name}`}
                description="Update attraction details. Slug must stay unique."
                actions={
                    <div className="flex items-center gap-2">
                        <DeleteAttractionButton id={attraction.id} name={attraction.short_name} />
                        <Link
                            href={`/attraction/${attraction.id}`}
                            className={cn(buttonVariants({ variant: 'outline' }))}
                        >
                            View
                        </Link>
                        <Link href="/attraction" className={cn(buttonVariants({ variant: 'outline' }))}>
                            Back to list
                        </Link>
                    </div>
                }
            />

            <div className="max-w-3xl overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
                <AttractionForm
                    cities={cities}
                    categories={categories}
                    attraction={{
                        id: attraction.id,
                        short_name: attraction.short_name,
                        full_name: attraction.full_name,
                        slug: attraction.slug,
                        address: attraction.address,
                        city_id: attraction.city_id,
                        category_id: attraction.category_id,
                        latitude: attraction.latitude ?? '',
                        longitude: attraction.longitude ?? '',
                        entry_fee: attraction.entry_fee,
                        currency_code: attraction.currency_code,
                        opening_time: toTimeInput(attraction.opening_time),
                        closing_time: toTimeInput(attraction.closing_time),
                        best_time_to_visit: attraction.best_time_to_visit ?? '',
                        travel_modes: attraction.travel_modes.join(', '),
                        short_description: attraction.short_description,
                        full_description: attraction.full_description ?? '',
                        instructions: attraction.instructions ?? '',
                        status: attraction.status,
                        is_active: attraction.is_active,
                    }}
                />
            </div>
        </div>
    )
}

export default EditAttractionPage
