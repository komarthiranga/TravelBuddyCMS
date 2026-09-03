import Link from 'next/link'
import { ImageIcon, Pencil, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import DeleteAttractionImageButton from '@/master/attraction/image/DeleteButton'
import type { attractionImage } from '@/master/attraction/image/types'

function AttractionImageGallery({
    attractionId,
    images,
}: {
    attractionId: number
    images: attractionImage[]
}) {
    return (
        <section className="space-y-4 overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-heading text-base font-semibold">Images</h2>
                    <p className="text-sm text-muted-foreground">
                        {images.length === 0
                            ? 'No images yet.'
                            : `${images.length} image${images.length === 1 ? '' : 's'}`}
                    </p>
                </div>
                <Link
                    href={`/attraction/${attractionId}/images/new`}
                    className={cn(buttonVariants({ size: 'sm' }))}
                >
                    <Plus data-icon="inline-start" />
                    Add image
                </Link>
            </div>

            {images.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
                    <ImageIcon className="size-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Add a URL and public ID to show photos here.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {images.map((image) => (
                        <article key={image.id} className="overflow-hidden rounded-lg border bg-background">
                            <div className="aspect-[4/3] bg-muted">
                                {/* External URLs vary by host, so a native img is used. */}
                                <img
                                    src={image.image_url}
                                    alt={image.alt_text || 'Attraction image'}
                                    className="size-full object-cover"
                                />
                            </div>
                            <div className="space-y-2 p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {image.alt_text || image.public_id}
                                        </p>
                                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                                            {image.public_id}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center">
                                        <Link
                                            href={`/attraction/${attractionId}/images/${image.id}/edit`}
                                            aria-label="Edit image"
                                            title="Edit"
                                            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-xs' }))}
                                        >
                                            <Pencil />
                                        </Link>
                                        <DeleteAttractionImageButton
                                            id={image.id}
                                            label={image.alt_text || image.public_id}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {image.is_primary ? <Badge variant="secondary">Primary</Badge> : null}
                                    <span className="text-[11px] text-muted-foreground">
                                        Order {image.display_order}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

export default AttractionImageGallery
