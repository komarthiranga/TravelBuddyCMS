import Image from 'next/image'

/** Generic artwork is never represented as a photograph of the actual venue. */
export function categoryArtwork(category: string, name = '') {
    const text = `${category} ${name}`.toLowerCase()
    if (/temple|devasthan|swamy|shivalayam/.test(text)) return 'temple'
    if (/restaurant|cafe|food|quick bites|market/.test(text)) return 'food'
    if (/hotel|stay|guest house/.test(text)) return 'stay'
    if (/park|garden|lake|waterfall|wildlife|viewpoint|tea plantation|adventure/.test(text)) return 'nature'
    if (/museum|historical|heritage/.test(text)) return 'culture'
    return 'explore'
}

export function PlaceImage({src, alt, name, category, sizes, eager = false, compact = false}: {
    src?: string | null; alt?: string | null; name: string; category: string;
    sizes: string; eager?: boolean; compact?: boolean
}) {
    const photo = src?.trim()
    return <>
        <Image src={photo || `/images/categories/${categoryArtwork(category, name)}.webp`}
            alt={photo ? (alt ?? name) : `AI-generated ${category.toLowerCase()} illustration; not a photo of ${name}`}
            fill preload={eager} sizes={sizes} className="object-cover" />
        {!photo && <span className={`absolute bottom-2 left-2 z-10 rounded bg-white/95 px-2 py-1 text-[10px] font-medium text-ink ${compact ? 'sr-only' : ''}`}>AI illustration</span>}
    </>
}
