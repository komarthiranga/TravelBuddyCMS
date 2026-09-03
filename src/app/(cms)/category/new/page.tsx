import Link from 'next/link'

import { PageHeader } from '@/components/cms/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import CategoryForm from '@/master/category/components/Form'

function NewCategoryPage() {
    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Master data"
                title="New category"
                description="Add a name, type, and unique code."
                actions={
                    <Link href="/category" className={cn(buttonVariants({ variant: 'outline' }))}>
                        Back to list
                    </Link>
                }
            />

            <div className="max-w-xl overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
                <CategoryForm />
            </div>
        </div>
    )
}

export default NewCategoryPage
