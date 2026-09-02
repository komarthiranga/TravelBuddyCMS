import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/cms/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCategoryById } from '@/master/category/api/getCategoryById'
import CategoryForm from '@/master/category/components/Form'
import DeleteCategoryButton from '@/master/category/components/DeleteButton'
import { parseCategoryId } from '@/master/category/db'

async function EditCategoryPage({
    params,
}: PageProps<'/category/[id]/edit'>) {
    const { id: rawId } = await params
    const id = parseCategoryId(rawId)

    if (!id) {
        notFound()
    }

    const category = await getCategoryById(id)

    if (!category) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Master data"
                title={`Edit ${category.name}`}
                description="Update the name, type, or code. Code must stay unique."
                actions={
                    <div className="flex items-center gap-2">
                        <DeleteCategoryButton id={category.id} name={category.name} />
                        <Link href="/category" className={cn(buttonVariants({ variant: 'outline' }))}>
                            Back to list
                        </Link>
                    </div>
                }
            />

            <div className="max-w-xl overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
                <CategoryForm
                    category={{
                        id: category.id,
                        name: category.name,
                        type: category.category_type,
                        code: category.code,
                    }}
                />
            </div>
        </div>
    )
}

export default EditCategoryPage
