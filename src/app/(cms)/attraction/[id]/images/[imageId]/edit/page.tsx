import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/cms/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAttractionById } from '@/master/attraction/api/getAttractionById'
import { getAttractionImageById } from '@/master/attraction/image/api'
import AttractionImageForm from '@/master/attraction/image/Form'
import { parseAttractionImageId } from '@/master/attraction/image/ids'
import { parseAttractionId } from '@/master/attraction/ids'

async function EditAttractionImagePage({
    params,
}: PageProps<'/attraction/[id]/images/[imageId]/edit'>) {
    const { id: rawAttractionId, imageId: rawImageId } = await params
    const attractionId = parseAttractionId(rawAttractionId)
    const imageId = parseAttractionImageId(rawImageId)

    if (!attractionId || !imageId) {
        notFound()
    }

    const [attraction, image] = await Promise.all([
        getAttractionById(attractionId),
        getAttractionImageById(imageId),
    ])

    if (!attraction || !image || image.attraction_id !== attractionId) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Content"
                title={`Edit image · ${attraction.short_name}`}
                description="Update URL, public ID, alt text, order, or primary flag."
                actions={
                    <Link
                        href={`/attraction/${attractionId}`}
                        className={cn(buttonVariants({ variant: 'outline' }))}
                    >
                        Back to attraction
                    </Link>
                }
            />

            <div className="max-w-xl overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
                <AttractionImageForm
                    image={{
                        id: image.id,
                        attraction_id: image.attraction_id,
                        image_url: image.image_url,
                        public_id: image.public_id,
                        alt_text: image.alt_text ?? '',
                        display_order: image.display_order,
                        is_primary: image.is_primary,
                    }}
                />
            </div>
        </div>
    )
}

export default EditAttractionImagePage
