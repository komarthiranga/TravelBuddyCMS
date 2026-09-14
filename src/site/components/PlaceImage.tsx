import Image from 'next/image'

import { isCategoryIllustration, resolvePlaceImage } from '@/site/lib/category-artwork'

export function PlaceImage({src, alt, name, category, sizes, eager = false, compact = false}: {
    src?: string | null; alt?: string | null; name: string; category: string;
    sizes: string; eager?: boolean; compact?: boolean
}) {
    const photo = src?.trim()
    const illustration = isCategoryIllustration(photo, alt)
    return <>
        <Image src={resolvePlaceImage(photo, alt, category, name)}
            alt={photo ? (alt ?? name) : `AI-generated ${category.toLowerCase()} illustration; not a photo of ${name}`}
            fill preload={eager} sizes={sizes} className="object-cover" />
        {photo?.includes('/travel-buddy/commons/58884991-') && <span className={`absolute bottom-2 left-2 z-10 rounded bg-white/95 px-2 py-1 text-[10px] text-ink ${compact ? 'sr-only' : ''}`}>IM3847 · 2017 · CC BY-SA 4.0</span>}
        {illustration && <span className={`absolute bottom-2 left-2 z-10 rounded bg-white/95 px-2 py-1 text-[10px] font-medium text-ink ${compact ? 'sr-only' : ''}`}>AI illustration</span>}
    </>
}
