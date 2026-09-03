import { Compass } from 'lucide-react'

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
    const dim =
        size === 'sm' ? 'size-8 text-[10px]' : size === 'lg' ? 'size-14 text-sm' : 'size-11 text-xs'

    return (
        <span
            aria-hidden="true"
            className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-ink text-white shadow-[0_8px_24px_-10px_oklch(0.2_0.03_250/0.55)] ${dim} ${float ? 'animate-buddy-float' : ''} ${className}`}
        >
            <span className="absolute inset-[2px] rounded-full border border-amber-brand/50" />
            <Compass className={size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-6' : 'size-5'} />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-cream bg-emerald-400" />
        </span>
    )
}
