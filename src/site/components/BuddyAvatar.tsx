/**
 * The local buddy, drawn as inline SVG and animated purely in CSS, so he costs
 * no JavaScript and no image request. Joints rotate around real pivot points
 * (shoulders at y=116, hips at y=166) set as view-box transform origins.
 *
 * Motion stops for anyone who asks for reduced motion — see globals.css.
 */
export type BuddyPose = 'wave' | 'talk' | 'walk' | 'point'

const SKIN = 'oklch(0.80 0.055 62)'
const SKIN_SHADE = 'oklch(0.74 0.06 62)'
const SHIRT = 'oklch(0.55 0.095 195)'
const SHIRT_SHADE = 'oklch(0.44 0.085 197)'
const TROUSERS = 'oklch(0.32 0.035 258)'
const SHOE = 'oklch(0.21 0.025 255)'
const HAIR = 'oklch(0.23 0.02 285)'
const STRAP = 'oklch(0.74 0.155 58)'

const LEFT_SHOULDER = { transformBox: 'view-box', transformOrigin: '48px 116px' } as const
const RIGHT_SHOULDER = { transformBox: 'view-box', transformOrigin: '112px 116px' } as const
const LEFT_HIP = { transformBox: 'view-box', transformOrigin: '70px 164px' } as const
const RIGHT_HIP = { transformBox: 'view-box', transformOrigin: '90px 164px' } as const

/** Where the right hand goes, per pose. */
const RIGHT_ARM: Record<
    BuddyPose,
    { arm: string; sleeve: string; hand: [number, number]; handRadius: number }
> = {
    wave: {
        arm: 'M112 116C133 113 145 96 143 72',
        sleeve: 'M112 115C122 113 129 109 132 103',
        hand: [144, 63],
        handRadius: 10.5,
    },
    talk: {
        arm: 'M112 116C124 129 130 143 126 155',
        sleeve: 'M112 115C118 121 122 128 123 133',
        hand: [126, 161],
        handRadius: 9.5,
    },
    walk: {
        arm: 'M112 116C121 134 122 154 116 170',
        sleeve: 'M112 115C116 123 118 130 118 136',
        hand: [115, 176],
        handRadius: 9.5,
    },
    point: {
        arm: 'M112 116C126 113 138 109 147 104',
        sleeve: 'M112 115C118 114 123 112 127 110',
        hand: [151, 102],
        handRadius: 9.5,
    },
}

export function BuddyAvatar({
    pose = 'talk',
    className = '',
    title,
}: {
    pose?: BuddyPose
    className?: string
    title?: string
}) {
    const walking = pose === 'walk'
    const rightArm = RIGHT_ARM[pose]

    const rightArmMotion =
        pose === 'wave'
            ? 'buddy-anim-wave'
            : pose === 'talk'
              ? 'buddy-anim-gesture'
              : walking
                ? 'buddy-anim-step'
                : ''

    return (
        <svg
            viewBox="0 0 160 264"
            role={title ? 'img' : 'presentation'}
            aria-label={title}
            aria-hidden={title ? undefined : 'true'}
            className={className}
        >
            {/* Ground shadow stays put while he bobs */}
            <ellipse cx="80" cy="251" rx="38" ry="6.5" fill="oklch(0.2 0.03 250)" opacity="0.17" />

            <g className={walking ? 'buddy-anim-bob-quick' : 'buddy-anim-bob'}>
                {/* ── Legs (behind the torso) ───────────────────── */}
                <g className={walking ? 'buddy-anim-step' : ''} style={LEFT_HIP}>
                    <path
                        d="M70 160L65 230"
                        stroke={TROUSERS}
                        strokeWidth="19"
                        strokeLinecap="round"
                    />
                    <ellipse cx="61" cy="240" rx="14" ry="7.5" fill={SHOE} />
                </g>
                <g className={walking ? 'buddy-anim-step-offset' : ''} style={RIGHT_HIP}>
                    <path
                        d="M90 160L95 230"
                        stroke={TROUSERS}
                        strokeWidth="19"
                        strokeLinecap="round"
                    />
                    <ellipse cx="99" cy="240" rx="14" ry="7.5" fill={SHOE} />
                </g>

                {/* ── Left arm (behind the torso, hanging) ──────── */}
                <g
                    className={walking ? 'buddy-anim-step-offset' : 'buddy-anim-gesture'}
                    style={LEFT_SHOULDER}
                >
                    <path
                        d="M48 116C39 134 38 154 44 170"
                        stroke={SKIN}
                        strokeWidth="14"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M48 115C44 121 42 128 41 134"
                        stroke={SHIRT}
                        strokeWidth="18"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <circle cx="45" cy="176" r="9.5" fill={SKIN} />
                </g>

                {/* ── Neck, tucked under the collar ─────────────── */}
                <rect x="71" y="78" width="18" height="24" rx="8" fill={SKIN_SHADE} />

                {/* ── Torso ─────────────────────────────────────── */}
                <path
                    d="M80 94c-20 0-33 10-34 28l-3 44c22 9 52 9 74 0l-3-44c-1-18-14-28-34-28z"
                    fill={SHIRT}
                />
                {/* collar */}
                <path
                    d="M70 96c4 8 16 8 20 0"
                    stroke={SHIRT_SHADE}
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                />
                {/* satchel strap and bag */}
                <path
                    d="M59 100c8 24 21 47 37 61"
                    stroke={STRAP}
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                />
                <rect x="92" y="152" width="26" height="22" rx="7" fill={STRAP} />
                <rect x="92" y="158" width="26" height="4" fill="oklch(0.63 0.16 48)" />

                {/* ── Right arm (in front, does the talking) ────── */}
                <g className={rightArmMotion} style={RIGHT_SHOULDER}>
                    <path
                        d={rightArm.arm}
                        stroke={SKIN}
                        strokeWidth="14"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d={rightArm.sleeve}
                        stroke={SHIRT}
                        strokeWidth="18"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <circle
                        cx={rightArm.hand[0]}
                        cy={rightArm.hand[1]}
                        r={rightArm.handRadius}
                        fill={SKIN}
                    />
                </g>

                {/* ── Head ──────────────────────────────────────── */}
                <circle cx="46" cy="56" r="6" fill={SKIN_SHADE} />
                <circle cx="114" cy="56" r="6" fill={SKIN_SHADE} />
                <circle cx="80" cy="52" r="34" fill={SKIN} />

                {/* hair: a cap with a soft fringe */}
                <path
                    d="M46 52c0-22 15-34 34-34s34 12 34 34c-5-9-13-13-22-11-7-8-24-8-32 0-7 0-12 4-14 11z"
                    fill={HAIR}
                />

                {/* eyebrows */}
                <path
                    d="M62 43c4-3 9-3 12 0"
                    stroke={HAIR}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                />
                <path
                    d="M86 43c3-3 8-3 12 0"
                    stroke={HAIR}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* eyes */}
                <g
                    className="buddy-anim-blink"
                    style={{ transformBox: 'view-box', transformOrigin: '80px 55px' }}
                >
                    <ellipse cx="68" cy="55" rx="4" ry="5.2" fill="oklch(0.22 0.02 265)" />
                    <ellipse cx="92" cy="55" rx="4" ry="5.2" fill="oklch(0.22 0.02 265)" />
                    <circle cx="69.4" cy="53.2" r="1.4" fill="white" />
                    <circle cx="93.4" cy="53.2" r="1.4" fill="white" />
                </g>

                {/* smile */}
                <path
                    d="M69 67c6 8 16 8 22 0"
                    stroke="oklch(0.34 0.05 32)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    fill="none"
                />
            </g>
        </svg>
    )
}
