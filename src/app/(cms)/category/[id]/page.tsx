import { redirect } from 'next/navigation'

import { parseCategoryId } from '@/master/category/db'

async function CategoryDetailPage({
    params,
}: PageProps<'/category/[id]'>) {
    const { id } = await params
    const categoryId = parseCategoryId(id)

    if (!categoryId) {
        redirect('/category')
    }

    redirect(`/category/${categoryId}/edit`)
}

export default CategoryDetailPage
