import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/cms/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCityById } from '@/master/city/api/getCityById'
import CityForm from '@/master/city/components/Form'
import DeleteCityButton from '@/master/city/components/DeleteButton'
import { parseCityId } from '@/master/city/ids'

async function EditCityPage({ params }: PageProps<'/city/[id]/edit'>) {
    const { id: rawId } = await params
    const id = parseCityId(rawId)

    if (!id) {
        notFound()
    }

    const city = await getCityById(id)

    if (!city) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Master data"
                title={`Edit ${city.name}`}
                description="Update city details. Code must stay unique."
                actions={
                    <div className="flex items-center gap-2">
                        <DeleteCityButton id={city.id} name={city.name} />
                        <Link href="/city" className={cn(buttonVariants({ variant: 'outline' }))}>
                            Back to list
                        </Link>
                    </div>
                }
            />

            <div className="max-w-xl overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
                <CityForm
                    city={{
                        id: city.id,
                        name: city.name,
                        code: city.code,
                        state: city.state,
                        country: city.country,
                        latitude: city.latitude ?? '',
                        longitude: city.longitude ?? '',
                        is_active: city.is_active,
                    }}
                />
            </div>
        </div>
    )
}

export default EditCityPage
