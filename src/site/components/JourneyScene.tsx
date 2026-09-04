import type { ReactNode } from 'react'

import { BuddyRide } from '@/site/components/BuddyRide'
import type { TravelMode } from '@/site/lib/travelModes'

/**
 * The road he takes you along: four parallax layers sliding past a buddy who
 * stays put in the middle, which reads as travelling. Every tile is drawn so
 * nothing crosses its left or right edge, so the doubled strip loops seamlessly.
 */
function Layer({
    speed,
    className,
    children,
}: {
    speed: 'far' | 'mid' | 'near' | 'road'
    className: string
    children: ReactNode
}) {
    const motion = {
        far: 'scene-scroll-far',
        mid: 'scene-scroll-mid',
        near: 'scene-scroll-near',
        road: 'scene-scroll-road',
    }[speed]

    return (
        <div aria-hidden="true" className={`absolute inset-x-0 ${className}`}>
            <div className={`flex h-full w-[200%] ${motion}`}>
                <div className="h-full w-1/2 shrink-0">{children}</div>
                <div className="h-full w-1/2 shrink-0">{children}</div>
            </div>
        </div>
    )
}

const HILL_FAR = 'oklch(0.34 0.045 235)'
const HILL_MID = 'oklch(0.27 0.04 240)'
const TREE = 'oklch(0.22 0.035 245)'
const TEMPLE = 'oklch(0.24 0.04 250)'
/* Asphalt kept mid-grey rather than black, so his dark trousers and the tyres
   still read against it. */
const ROAD = 'oklch(0.37 0.01 260)'
const ROAD_EDGE = 'oklch(0.47 0.012 260)'
const DASH = 'oklch(0.86 0.09 90)'

function FarHills() {
    return (
        <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="size-full">
            <path
                d="M0 200V132q75-42 150 0t150 0q75-42 150 0t150 0v68z"
                fill={HILL_FAR}
                opacity="0.85"
            />
        </svg>
    )
}

function MidScenery() {
    /** x positions kept well inside the tile so the loop has no visible seam. */
    const palms = [70, 250, 470]
    const houses = [150, 330, 520]

    return (
        <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="size-full">
            <path d="M0 200V150q100-30 200 0t200 0q100-30 200 0v50z" fill={HILL_MID} />

            {/* a gopuram on the skyline, because this is Andhra */}
            <path d="M395 200V120l30-38 30 38v80z" fill={TEMPLE} />
            <path d="M410 82h30l-15-20z" fill={TEMPLE} />
            <rect x="418" y="150" width="14" height="50" rx="4" fill={HILL_MID} />

            {palms.map((x) => (
                <g key={x} fill={TREE}>
                    <rect x={x} y="118" width="7" height="82" rx="3" />
                    <path
                        d={`M${x + 3.5} 118c-22-6-34-18-32-30 10 8 22 12 32 14 10-2 22-6 32-14 2 12-10 24-32 30z`}
                    />
                </g>
            ))}

            {houses.map((x) => (
                <g key={x} fill={TREE}>
                    <rect x={x} y="158" width="54" height="42" rx="5" />
                    <path d={`M${x - 6} 158l33-24 33 24z`} />
                </g>
            ))}
        </svg>
    )
}

function NearScenery() {
    const bushes = [40, 190, 340, 500]
    const poles = [110, 380]

    return (
        <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="size-full">
            {poles.map((x) => (
                <g key={x}>
                    <rect x={x} y="40" width="8" height="140" rx="3" fill={ROAD_EDGE} />
                    <rect x={x - 22} y="40" width="52" height="7" rx="3" fill={ROAD_EDGE} />
                </g>
            ))}
            {bushes.map((x) => (
                <g key={x} fill={TREE}>
                    <ellipse cx={x} cy="176" rx="34" ry="22" />
                    <ellipse cx={x + 26} cy="182" rx="24" ry="16" />
                </g>
            ))}
        </svg>
    )
}

function Road() {
    /** 6 dashes across 600 units keeps the seam invisible. */
    const dashes = [20, 120, 220, 320, 420, 520]

    return (
        <svg viewBox="0 0 600 100" preserveAspectRatio="none" className="size-full">
            <rect width="600" height="100" fill={ROAD} />
            <rect width="600" height="7" fill={ROAD_EDGE} />
            {dashes.map((x) => (
                <rect key={x} x={x} y="46" width="58" height="8" rx="4" fill={DASH} opacity="0.7" />
            ))}
        </svg>
    )
}

export function JourneyScene({
    mode,
    moving = true,
    framed = true,
    lift = false,
    className = '',
}: {
    mode: TravelMode
    moving?: boolean
    framed?: boolean
    /** Sit the rider higher so a caption panel doesn't cover the wheels. */
    lift?: boolean
    className?: string
}) {
    return (
        <div
            className={`relative isolate overflow-hidden ${
                framed ? 'rounded-[1.5rem] border border-white/10' : ''
            } ${className}`}
        >
            {/* dusk sky */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.24_0.05_265),oklch(0.36_0.07_250)_45%,oklch(0.62_0.12_60)_88%)]"
            />
            <span
                aria-hidden="true"
                className="absolute bottom-[26%] left-[18%] size-16 rounded-full bg-[radial-gradient(circle,oklch(0.92_0.14_75),oklch(0.8_0.16_55))] blur-[1px]"
            />

            {moving ? (
                <>
                    <Layer speed="far" className="bottom-[21%] h-[42%]">
                        <FarHills />
                    </Layer>
                    <Layer speed="mid" className="bottom-[19%] h-[46%]">
                        <MidScenery />
                    </Layer>
                    <Layer speed="near" className="bottom-[16%] h-[44%]">
                        <NearScenery />
                    </Layer>
                    <Layer speed="road" className="bottom-0 h-[22%]">
                        <Road />
                    </Layer>
                </>
            ) : (
                /* Arrived: the same scene, held still */
                <>
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-[21%] h-[42%]">
                        <FarHills />
                    </div>
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-[19%] h-[46%]">
                        <MidScenery />
                    </div>
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[22%]">
                        <Road />
                    </div>
                </>
            )}

            {/* him, holding the middle of the frame while the world slides by.
                On foot he sits lower, so his dark legs land against the road
                rather than against the dark hills behind it. */}
            <div
                className={`absolute left-1/2 -translate-x-1/2 ${
                    lift
                        ? 'bottom-[8%] h-[64%] sm:bottom-[10%] sm:h-[68%]'
                        : mode === 'walk'
                          ? 'bottom-0 h-[76%]'
                          : 'bottom-[8%] h-[74%]'
                }`}
            >
                <BuddyRide mode={mode} className="h-full w-auto" />
            </div>
        </div>
    )
}
