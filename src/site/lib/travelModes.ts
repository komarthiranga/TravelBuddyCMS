import { Bike, Bus, Car, Footprints, type LucideIcon, Truck } from 'lucide-react'

/** The ways he can travel with you. */
export type TravelMode = 'walk' | 'cycle' | 'auto' | 'bus' | 'car'

export const TRAVEL_MODES: Record<
    TravelMode,
    {
        label: string
        /** How he offers it, in his own voice. */
        hint: string
        icon: LucideIcon
        /** Rough speed for the estimate — always shown prefixed with "about". */
        kmh: number
        /** Sensible upper distance before the mode stops being reasonable. */
        comfortableUpToKm: number
    }
> = {
    walk: {
        label: 'On foot',
        hint: "Slowest, but you'll actually see the place",
        icon: Footprints,
        kmh: 4.5,
        comfortableUpToKm: 3,
    },
    cycle: {
        label: 'By cycle',
        hint: 'Good early morning, before the heat',
        icon: Bike,
        kmh: 13,
        comfortableUpToKm: 12,
    },
    auto: {
        label: 'By auto',
        hint: 'What I would take — agree the fare first',
        icon: Truck,
        kmh: 26,
        comfortableUpToKm: 25,
    },
    bus: {
        label: 'By bus',
        hint: 'Cheapest, but you wait for it',
        icon: Bus,
        kmh: 22,
        comfortableUpToKm: 80,
    },
    car: {
        label: 'By car',
        hint: 'Easiest if the family is with you',
        icon: Car,
        kmh: 36,
        comfortableUpToKm: 400,
    },
}

export const TRAVEL_MODE_ORDER: TravelMode[] = ['walk', 'cycle', 'auto', 'bus', 'car']

/**
 * `travel_modes` is free text in the CMS ("Auto, Bus, Car", "on foot", "Taxi"),
 * so everything is folded down to a known mode before it reaches the UI.
 */
export function normaliseMode(raw: string): TravelMode | null {
    const key = raw.trim().toLowerCase().replace(/[\s_-]+/g, '')

    if (['walk', 'walking', 'onfoot', 'foot', 'byfoot'].includes(key)) return 'walk'
    if (['cycle', 'cycling', 'bicycle', 'bike', 'pushbike'].includes(key)) return 'cycle'
    if (['auto', 'autorickshaw', 'rickshaw', 'tuktuk', 'share auto'].includes(key)) return 'auto'
    if (['bus', 'apsrtc', 'publicbus', 'train', 'rail', 'metro'].includes(key)) return 'bus'
    if (['car', 'taxi', 'cab', 'drive', 'driving', 'bike taxi', 'scooter'].includes(key))
        return 'car'

    return null
}

/** The modes a place lists, folded to known ones and de-duplicated. */
export function modesForPlace(rawModes: string[]): TravelMode[] {
    const found = new Set<TravelMode>()
    for (const raw of rawModes) {
        const mode = normaliseMode(raw)
        if (mode) found.add(mode)
    }
    return TRAVEL_MODE_ORDER.filter((mode) => found.has(mode))
}

/** Minutes for a leg, never below one. */
export function minutesFor(km: number, mode: TravelMode): number {
    return Math.max(1, Math.round((km / TRAVEL_MODES[mode].kmh) * 60))
}
