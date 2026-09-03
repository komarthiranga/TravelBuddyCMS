import Link from 'next/link'

import { PageHeader } from '@/components/cms/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import CityForm from '@/master/city/components/Form'

function NewCityPage() {
    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Master data"
                title="New city"
                description="Add a name, unique code, state, and country. Coordinates are optional."
                actions={
                    <Link href="/city" className={cn(buttonVariants({ variant: 'outline' }))}>
                        Back to list
                    </Link>
                }
            />

            <div className="max-w-xl overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
                <CityForm />
            </div>
        </div>
    )
}

export default NewCityPage
