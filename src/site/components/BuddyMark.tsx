import Image from 'next/image'

import { BUDDY_FACE_SRC } from '@/site/components/BuddyMascot'

/** Small face of the local guide — used next to speech and chapter labels. */
export function BuddyMark({
    size = 'md',
    float = false,
    className = '',
}: {
    size?: 'sm' | 'md' | 'lg'
    float?: boolean
    className?: string
}) {
    const dim = size === 'sm' ? 'size-8' : size === 'lg' ? 'size-14' : 'size-11'

    return (
        <span
            aria-hidden="true"
            className={`relative inline-flex shrink-0 ${dim} ${float ? 'animate-buddy-float' : ''} ${className}`}
        >
            <span className="absolute inset-0 overflow-hidden rounded-full bg-teal-wash shadow-[0_8px_24px_-10px_oklch(0.2_0.03_250/0.55)]">
                <Image
                    src={BUDDY_FACE_SRC}
                    alt=""
                    fill
                    sizes="56px"
                    unoptimized
                    className="object-cover object-[50%_40%]"
                />
            </span>
            <span className="pointer-events-none absolute inset-[2px] rounded-full border border-amber-brand/50" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-cream bg-emerald-400" />
        </span>
    )
}
