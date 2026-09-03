import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/cms/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAttractionById } from '@/master/attraction/api/getAttractionById'
import AttractionImageForm from '@/master/attraction/image/Form'
import { parseAttractionId } from '@/master/attraction/ids'

async function NewAttractionImagePage({
    params,
}: PageProps<'/attraction/[id]/images/new'>) {
    const { id: rawId } = await params
    const attractionId = parseAttractionId(rawId)

    if (!attractionId) {
        notFound()
    }

    const attraction = await getAttractionById(attractionId)

    if (!attraction) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                eyebrow="Content"
                title={`Add image · ${attraction.short_name}`}
                description="Save an image URL and a unique public ID."
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
                        attraction_id: attractionId,
                        image_url: '',
                        public_id: '',
                        alt_text: '',
                        display_order: 0,
                        is_primary: false,
                    }}
                />
            </div>
        </div>
    )
}

export default NewAttractionImagePage
