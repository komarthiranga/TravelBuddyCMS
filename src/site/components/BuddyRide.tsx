import { BuddyFace, BuddyMascot, BuddyTorso, SCARF, SHIRT, SKIN } from '@/site/components/BuddyMascot'
import type { TravelMode } from '@/site/lib/travelModes'

const TYRE = 'oklch(0.19 0.015 260)'
const RIM = 'oklch(0.88 0.008 260)'
const HUB = 'oklch(0.45 0.02 260)'
const METAL = 'oklch(0.62 0.02 250)'
const GLASS = 'oklch(0.86 0.03 210)'
const AUTO_YELLOW = 'oklch(0.82 0.16 92)'
const AUTO_GREEN = 'oklch(0.52 0.12 155)'
const BUS_BLUE = 'oklch(0.48 0.09 250)'
const CAR_RED = 'oklch(0.58 0.16 25)'

function BuddyBust({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
    return (
        <g transform={`translate(${cx - 110 * scale} ${cy - 82 * scale}) scale(${scale})`}>
            <BuddyTorso />
            <BuddyFace />
        </g>
    )
}

function Wheel({ cx, cy, r, slow = false }: { cx: number; cy: number; r: number; slow?: boolean }) {
    const spoke = r * 0.55
    return (
        <g>
            <circle cx={cx} cy={cy} r={r} fill={TYRE} />
            <circle cx={cx} cy={cy} r={r * 0.62} fill={RIM} />
            <g
                className={slow ? 'wheel-spin-slow' : 'wheel-spin'}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
                {[0, 45, 90, 135].map((angle) => {
                    const rad = (angle * Math.PI) / 180
                    return (
                        <line
                            key={angle}
                            x1={cx - spoke * Math.cos(rad)}
                            y1={cy - spoke * Math.sin(rad)}
                            x2={cx + spoke * Math.cos(rad)}
                            y2={cy + spoke * Math.sin(rad)}
                            stroke={HUB}
                            strokeWidth={r * 0.09}
                            strokeLinecap="round"
                        />
                    )
                })}
            </g>
            <circle cx={cx} cy={cy} r={r * 0.17} fill={HUB} />
        </g>
    )
}

function Grip({ x, y, r = 9 }: { x: number; y: number; r?: number }) {
    return <circle cx={x} cy={y} r={r} fill={SKIN} />
}

const RIDE_VIEWBOX = '0 0 340 230'

export function BuddyRide({
    mode,
    className = '',
    title,
}: {
    mode: TravelMode
    className?: string
    title?: string
}) {
    if (mode === 'walk') {
        return <BuddyMascot pose="walk" className={className} title={title} />
    }

    return (
        <svg
            viewBox={RIDE_VIEWBOX}
            role={title ? 'img' : 'presentation'}
            aria-label={title}
            aria-hidden={title ? undefined : 'true'}
            className={className}
        >
            <ellipse cx="170" cy="216" rx="132" ry="8" fill="oklch(0.2 0.03 250)" opacity="0.16" />
            {mode === 'cycle' && <Cycle />}
            {mode === 'auto' && <Auto />}
            {mode === 'bus' && <Bus />}
            {mode === 'car' && <Car />}
        </svg>
    )
}

function Cycle() {
    return (
        <>
            <g className="vehicle-jiggle">
                <path
                    d="M78 186L152 118M152 118L236 132M152 118L142 186M142 186H78M142 186L236 132"
                    stroke={SHIRT}
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                />
                <path d="M152 118V104" stroke={METAL} strokeWidth="7" strokeLinecap="round" fill="none" />
                <ellipse cx="150" cy="101" rx="17" ry="6" fill={TYRE} />
                <path d="M236 132V96" stroke={METAL} strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M220 92H252" stroke={TYRE} strokeWidth="8" strokeLinecap="round" fill="none" />
                <circle cx="142" cy="186" r="9" fill={HUB} />
                <BuddyBust cx={168} cy={58} scale={0.42} />
                <path
                    d="M196 96C214 92 228 92 240 92"
                    stroke={SKIN}
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                />
                <Grip x={243} y={92} />
            </g>
            <Wheel cx={78} cy={186} r={34} />
            <Wheel cx={236} cy={186} r={34} />
        </>
    )
}

function Auto() {
    return (
        <>
            <g className="vehicle-jiggle">
                <path d="M96 190V116c0-30 22-50 56-50h58c34 0 58 22 58 54v70z" fill={AUTO_YELLOW} />
                <path d="M96 158h172v32H96z" fill={AUTO_GREEN} />
                <path
                    d="M186 88h60c10 8 16 19 16 34v32h-76z"
                    fill="oklch(0.3 0.03 250)"
                    opacity="0.32"
                />
                <path d="M112 118c0-20 14-34 34-36v46h-34z" fill={GLASS} />
                <circle cx="103" cy="132" r="9" fill={GLASS} />
                <BuddyBust cx={150} cy={88} scale={0.4} />
                <path
                    d="M124 130C114 132 108 136 104 142"
                    stroke={SKIN}
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                />
                <Grip x={102} y={145} r={8} />
            </g>
            <Wheel cx={118} cy={190} r={30} />
            <Wheel cx={250} cy={190} r={30} />
        </>
    )
}

function Bus() {
    return (
        <>
            <g className="vehicle-jiggle">
                <rect x="24" y="62" width="292" height="128" rx="22" fill={BUS_BLUE} />
                <rect x="24" y="150" width="292" height="22" fill="oklch(0.38 0.08 250)" />
                <rect x="42" y="80" width="60" height="46" rx="9" fill={GLASS} />
                <rect x="112" y="80" width="30" height="46" rx="9" fill={GLASS} />
                <rect x="196" y="80" width="52" height="46" rx="9" fill={GLASS} />
                <rect x="258" y="80" width="46" height="46" rx="9" fill={GLASS} />
                <rect x="150" y="80" width="34" height="92" rx="8" fill={GLASS} opacity="0.75" />
                <rect x="42" y="66" width="60" height="10" rx="4" fill={SCARF} />
                <BuddyBust cx={127} cy={90} scale={0.28} />
            </g>
            <Wheel cx={92} cy={190} r={30} slow />
            <Wheel cx={252} cy={190} r={30} slow />
        </>
    )
}

function Car() {
    return (
        <>
            <g className="vehicle-jiggle">
                <path
                    d="M22 184c-4-26 2-42 18-50l30-24c14-11 28-16 48-16h84c22 0 38 6 52 20l26 26c16 8 24 22 22 44z"
                    fill={CAR_RED}
                />
                <path d="M24 168h292v16H24z" fill="oklch(0.46 0.14 25)" />
                <path d="M84 116l26-22c10-8 20-12 34-12h6v34z" fill={GLASS} />
                <path d="M164 82h50c14 0 24 4 32 12l14 22h-96z" fill={GLASS} />
                <rect x="24" y="140" width="16" height="12" rx="5" fill={GLASS} />
                <rect x="292" y="142" width="14" height="12" rx="5" fill={SCARF} />
                <BuddyBust cx={140} cy={88} scale={0.3} />
                <path
                    d="M120 122C112 124 106 128 102 134"
                    stroke={SKIN}
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                />
                <Grip x={100} y={136} r={7.5} />
            </g>
            <Wheel cx={92} cy={184} r={32} />
            <Wheel cx={252} cy={184} r={32} />
        </>
    )
}
