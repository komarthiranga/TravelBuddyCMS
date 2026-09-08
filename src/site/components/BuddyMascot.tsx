import Image from 'next/image'

/**
 * Your local buddy — a compass with a map, waving hello and walking you there.
 * Greetings swap in a separate arm layer so the wave is real; directions bounce
 * the whole figure like a walk.
 */
export type BuddyPose = 'wave' | 'talk' | 'walk' | 'point'

export const BUDDY_SRC = '/buddy-compass.png'
export const BUDDY_FACE_SRC = '/buddy-compass-face.png'
export const BUDDY_BODY_SRC = '/buddy-compass-body.png'
export const BUDDY_ARM_SRC = '/buddy-compass-arm.png'

const BUDDY_SIZE = { width: 985, height: 1017 } as const

function BuddyArt({ src }: { src: string }) {
    return (
        <Image
            src={src}
            alt=""
            width={BUDDY_SIZE.width}
            height={BUDDY_SIZE.height}
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 280px, 384px"
            unoptimized
            className="buddy-mascot-art"
        />
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
    const waving = pose === 'wave'

    return (
        <span
            role={title ? 'img' : 'presentation'}
            aria-label={title}
            aria-hidden={title ? undefined : true}
            className={`buddy-mascot relative inline-flex items-end justify-center ${className}`}
        >
            <span className={`buddy-mascot-shadow buddy-shadow-${pose}`} />
            <span className={`buddy-mascot-rig buddy-pose-${pose}`}>
                {waving ? (
                    <span className="buddy-mascot-stack">
                        <BuddyArt src={BUDDY_BODY_SRC} />
                        <span className="buddy-mascot-arm">
                            <BuddyArt src={BUDDY_ARM_SRC} />
                        </span>
                    </span>
                ) : (
                    <BuddyArt src={BUDDY_SRC} />
                )}
            </span>
        </span>
    )
}

export const BuddyChibi = BuddyMascot
