/**
 * Your local buddy — a human guide. Oval head, attached arms, and a kurta
 * so he reads as a person at every size, including the map pin.
 */
export type BuddyPose = 'wave' | 'talk' | 'walk' | 'point'

const SKIN = 'oklch(0.82 0.055 62)'
const SKIN_SHADE = 'oklch(0.74 0.065 62)'
const BLUSH = 'oklch(0.72 0.12 28)'
const SHIRT = 'oklch(0.55 0.095 195)'
const SHIRT_DARK = 'oklch(0.44 0.085 197)'
const TROUSERS = 'oklch(0.33 0.035 258)'
const SHOE = 'oklch(0.21 0.025 255)'
const HAIR = 'oklch(0.22 0.02 285)'
const SCARF = 'oklch(0.74 0.155 58)'
const EYE = 'oklch(0.24 0.03 265)'
const MOUTH = 'oklch(0.34 0.05 32)'

const LEFT_SHOULDER = { transformBox: 'view-box', transformOrigin: '68px 148px' } as const
const RIGHT_SHOULDER = { transformBox: 'view-box', transformOrigin: '152px 148px' } as const
const LEFT_HIP = { transformBox: 'view-box', transformOrigin: '92px 186px' } as const
const RIGHT_HIP = { transformBox: 'view-box', transformOrigin: '128px 186px' } as const
const EYES_CENTRE = { transformBox: 'view-box', transformOrigin: '110px 82px' } as const

const RIGHT_ARM: Record<
    BuddyPose,
    { arm: string; sleeve: string; hand: [number, number] }
> = {
    wave: {
        arm: 'M152 148C196 142 214 108 206 72',
        sleeve: 'M152 147C168 144 178 136 184 126',
        hand: [204, 62],
    },
    talk: {
        arm: 'M152 148C168 162 172 176 166 188',
        sleeve: 'M152 147C160 154 164 162 165 170',
        hand: [165, 196],
    },
    point: {
        arm: 'M152 148C176 146 194 140 208 134',
        sleeve: 'M152 147C162 146 170 144 176 142',
        hand: [212, 132],
    },
    walk: {
        arm: 'M152 148C166 164 168 178 162 190',
        sleeve: 'M152 147C158 156 161 164 162 172',
        hand: [161, 196],
    },
}

export function BuddyFace() {
    return (
        <>
            <circle cx="58" cy="86" r="9" fill={SKIN_SHADE} />
            <circle cx="162" cy="86" r="9" fill={SKIN_SHADE} />

            <ellipse cx="110" cy="82" rx="52" ry="56" fill={SKIN} />

            <path
                d="M58 74A52 56 0 0 1 162 74C157 54 150 42 140 38C128 50 116 52 110 48C98 52 84 48 72 38C62 42 55 54 58 74Z"
                fill={HAIR}
            />

            <ellipse cx="74" cy="102" rx="10" ry="6" fill={BLUSH} opacity="0.28" />
            <ellipse cx="146" cy="102" rx="10" ry="6" fill={BLUSH} opacity="0.28" />

            <path
                d="M76 66c8-5 18-5 26 0"
                stroke={HAIR}
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M118 66c8-5 18-5 26 0"
                stroke={HAIR}
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
            />

            <g className="buddy-anim-blink" style={EYES_CENTRE}>
                <ellipse cx="88" cy="84" rx="13" ry="15" fill="white" />
                <ellipse cx="132" cy="84" rx="13" ry="15" fill="white" />
                <circle cx="90" cy="86" r="8" fill={EYE} />
                <circle cx="134" cy="86" r="8" fill={EYE} />
                <circle cx="93" cy="82" r="3" fill="white" />
                <circle cx="137" cy="82" r="3" fill="white" />
            </g>

            <ellipse cx="110" cy="100" rx="3.2" ry="2.4" fill={SKIN_SHADE} />
            <path
                d="M96 110c8 10 20 10 28 0"
                stroke={MOUTH}
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
            />
        </>
    )
}

export function BuddyTorso() {
    return (
        <>
            <path
                d="M110 132c-28 0-44 12-46 30l-2 28c28 10 68 10 96 0l-2-28c-2-18-18-30-46-30z"
                fill={SHIRT}
            />
            <path d="M70 144c14 12 66 12 80 0l4 14c-18 12-70 12-88 0z" fill={SCARF} />
            <path
                d="M88 138c8 6 36 6 44 0"
                stroke={SHIRT_DARK}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
            />
        </>
    )
}

export function BuddyMascot({
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
    const rightMotion =
        pose === 'wave'
            ? 'buddy-anim-wave'
            : pose === 'talk'
              ? 'buddy-anim-gesture'
              : walking
                ? 'buddy-anim-step'
                : ''

    return (
        <svg
            viewBox="0 0 230 250"
            role={title ? 'img' : 'presentation'}
            aria-label={title}
            aria-hidden={title ? undefined : 'true'}
            className={className}
        >
            <ellipse cx="110" cy="238" rx="50" ry="7" fill="oklch(0.2 0.03 250)" opacity="0.16" />

            <g className={walking ? 'buddy-anim-bob-quick' : 'buddy-anim-bob'}>
                <g className={walking ? 'buddy-anim-step' : ''} style={LEFT_HIP}>
                    <rect x="80" y="178" width="22" height="36" rx="11" fill={TROUSERS} />
                    <ellipse cx="88" cy="216" rx="14" ry="8" fill={SHOE} />
                </g>
                <g className={walking ? 'buddy-anim-step-offset' : ''} style={RIGHT_HIP}>
                    <rect x="118" y="178" width="22" height="36" rx="11" fill={TROUSERS} />
                    <ellipse cx="132" cy="216" rx="14" ry="8" fill={SHOE} />
                </g>

                <g
                    className={walking ? 'buddy-anim-step-offset' : 'buddy-anim-gesture'}
                    style={LEFT_SHOULDER}
                >
                    <path
                        d="M68 148C54 162 50 176 54 188"
                        stroke={SKIN}
                        strokeWidth="16"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M68 147C60 154 56 162 55 170"
                        stroke={SHIRT}
                        strokeWidth="20"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <circle cx="54" cy="196" r="11" fill={SKIN} />
                </g>

                <BuddyTorso />
                <BuddyFace />

                <g className={rightMotion} style={RIGHT_SHOULDER}>
                    <path
                        d={rightArm.arm}
                        stroke={SKIN}
                        strokeWidth="16"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d={rightArm.sleeve}
                        stroke={SHIRT}
                        strokeWidth="20"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <circle cx={rightArm.hand[0]} cy={rightArm.hand[1]} r="11" fill={SKIN} />
                </g>
            </g>
        </svg>
    )
}

export const BuddyChibi = BuddyMascot

export { SKIN, SHIRT, SHIRT_DARK, TROUSERS, SHOE, HAIR, SCARF }
