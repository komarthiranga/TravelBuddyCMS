import Link from 'next/link'
import { Landmark, Plus } from 'lucide-react'

import { PageHeader } from '@/components/cms/page-header'
import { buttonVariants } from '@/components/ui/button'
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { getAttractions } from '@/features/attractions/api/getAttractions'
import AttractionsList from '@/features/attractions/components/List'

async function AttractionsPage() {
    const data = await getAttractions()

    const attractions = (data?.features ?? [])
        .map((feature: { properties?: { name?: string; place_id?: string; formatted?: string } }) => ({
            name: feature.properties?.name ?? '',
            place_id: feature.properties?.place_id ?? '',
            formatted: feature.properties?.formatted ?? '',
        }))
        .filter((attraction: { name: string }) => attraction.name)

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Content"
                title="Attractions"
                description="Points of interest around Munnar, Kerala."
                count={attractions.length}
                actions={
                    <Link href="/attractions/new" className={cn(buttonVariants())}>
                        <Plus data-icon="inline-start" />
                        Add attraction
                    </Link>
                }
            />

            {attractions.length === 0 ? (
                <Empty className="border border-dashed bg-card py-16">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Landmark />
                        </EmptyMedia>
                        <EmptyTitle>No attractions found</EmptyTitle>
                        <EmptyDescription>
                            We could not find any attractions for this city yet.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <AttractionsList attarctionsData={attractions} />
            )}
        </div>
    )
}

export default AttractionsPage
