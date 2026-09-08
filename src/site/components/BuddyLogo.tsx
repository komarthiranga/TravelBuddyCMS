/**
 * TravelBuddy brand mark — a smiling compass.
 * Drawn as SVG so it stays sharp from favicon size up to the footer.
 */
export function BuddyLogoMark({ className = '' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 64 64"
            className={className}
            aria-hidden="true"
            focusable="false"
        >
            {/* pocket-watch loop */}
            <circle cx="32" cy="7.5" r="4.6" fill="none" stroke="#1A2330" strokeWidth="2.6" />
            <circle cx="32" cy="11" r="2.2" fill="#C4A35A" />

            {/* navy housing */}
            <circle cx="32" cy="34" r="24.5" fill="#1A2330" />
            {/* teal inner rim */}
            <circle cx="32" cy="34" r="20.2" fill="none" stroke="#2F8A82" strokeWidth="2.4" />
            {/* cream dial */}
            <circle cx="32" cy="34" r="18.4" fill="#F4EAD7" />

            {/* cardinal ticks */}
            <path d="M32 17.2l2.1 3.6H29.9z" fill="#C4A35A" />
            <path d="M48.8 34l-3.6 2.1v-4.2z" fill="#C4A35A" />
            <path d="M32 50.8l-2.1-3.6h4.2z" fill="#C4A35A" />
            <path d="M15.2 34l3.6-2.1v4.2z" fill="#C4A35A" />

            {/* eyes */}
            <ellipse cx="26.2" cy="31.2" rx="2.35" ry="3.15" fill="#1A2330" />
            <ellipse cx="37.8" cy="31.2" rx="2.35" ry="3.15" fill="#1A2330" />
            <circle cx="26.9" cy="30.1" r="0.7" fill="white" />
            <circle cx="38.5" cy="30.1" r="0.7" fill="white" />

            {/* orange north needle as the nose */}
            <path d="M32 19.4L36.4 36.2 32 34.4 27.6 36.2z" fill="#E08A12" />
            <circle cx="32" cy="34.6" r="2.7" fill="#C4A35A" />
            <circle cx="32" cy="34.6" r="1.15" fill="#1A2330" />

            {/* smile */}
            <path
                d="M25.6 41.2c2.1 3.1 10.7 3.1 12.8 0"
                fill="none"
                stroke="#1A2330"
                strokeWidth="1.7"
                strokeLinecap="round"
            />

            {/* orange neckerchief */}
            <path
                d="M17.4 48.6c4.6 7.2 24.6 7.2 29.2 0"
                fill="none"
                stroke="#E08A12"
                strokeWidth="4.2"
                strokeLinecap="round"
            />
            <path d="M29.2 54.2 L32 62 L34.8 54.2 Q32 56.4 29.2 54.2" fill="#E08A12" />
            <path d="M31.2 55.4 L27.4 61.6 L33.2 56.8z" fill="#C45C26" />
            <path d="M32.8 55.4 L36.6 61.6 L30.8 56.8z" fill="#C45C26" />
        </svg>
    )
}

export function BuddyLogo({
    size = 'md',
    tone = 'light',
    withWordmark = true,
    className = '',
}: {
    size?: 'sm' | 'md' | 'lg'
    tone?: 'light' | 'dark'
    withWordmark?: boolean
    className?: string
}) {
    const mark =
        size === 'sm' ? 'size-8' : size === 'lg' ? 'size-14' : 'size-11'
    const type =
        size === 'sm'
            ? 'text-[1.05rem] sm:text-lg'
            : size === 'lg'
              ? 'text-2xl'
              : 'text-xl'
    const buddy = tone === 'dark' ? 'text-amber-brand' : 'text-amber-brand-dark'

    return (
        <span className={`inline-flex min-w-0 items-center gap-2 sm:gap-2.5 ${className}`}>
            <BuddyLogoMark className={`${mark} shrink-0`} />
            {withWordmark && (
                <span
                    className={`font-display leading-none tracking-tight whitespace-nowrap ${type}`}
                >
                    <span className="max-[22rem]:hidden">Travel</span>
                    <span className={buddy}>Buddy</span>
                </span>
            )}
        </span>
    )
}
