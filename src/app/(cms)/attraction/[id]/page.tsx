import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/cms/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAttractionById } from '@/master/attraction/api/getAttractionById'
import AttractionView from '@/master/attraction/components/View'
import { getAttractionImages } from '@/master/attraction/image/api'
import AttractionImageGallery from '@/master/attraction/image/Gallery'
import type { attractionImage } from '@/master/attraction/image/types'
import { parseAttractionId } from '@/master/attraction/ids'
import { serializeAttraction } from '@/master/attraction/serialize'

async function AttractionDetailPage({ params }: PageProps<'/attraction/[id]'>) {
    const { id: rawId } = await params
    const id = parseAttractionId(rawId)

    if (!id) {
        notFound()
    }

    const [row, imageRows] = await Promise.all([
        getAttractionById(id),
        getAttractionImages(id),
    ])

    if (!row) {
        notFound()
    }

    const attraction = serializeAttraction(row)
    const images: attractionImage[] = imageRows.map((image) => ({
        id: image.id,
        attraction_id: image.attraction_id,
        image_url: image.image_url,
        public_id: image.public_id,
        alt_text: image.alt_text,
        display_order: image.display_order,
        is_primary: image.is_primary,
        created_at:
            image.created_at instanceof Date ? image.created_at.toISOString() : String(image.created_at),
        updated_at:
            image.updated_at instanceof Date ? image.updated_at.toISOString() : String(image.updated_at),
    }))

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Content"
                title={attraction.short_name}
                description={attraction.full_name}
                actions={
                    <Link href="/attraction" className={cn(buttonVariants({ variant: 'outline' }))}>
                        Back to list
                    </Link>
                }
            />

            <AttractionView attraction={attraction} />
            <AttractionImageGallery attractionId={attraction.id} images={images} />
        </div>
    )
}

export default AttractionDetailPage
