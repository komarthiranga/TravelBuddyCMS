'use client'

import { useEffect } from 'react'

import { useLocation } from '@/site/components/location-provider'
import { toCoords } from '@/site/lib/geo'

export function CityCentreSync({
    name,
    latitude,
    longitude,
}: {
    name: string
    latitude: string | number | null
    longitude: string | number | null
}) {
    const { setCityCentre } = useLocation()
    const lat = latitude == null ? null : String(latitude)
    const lng = longitude == null ? null : String(longitude)

    useEffect(() => {
        const coords = toCoords(lat, lng)
        if (!coords) {
            setCityCentre(null)
            return
        }
        setCityCentre({ name, coords })
    }, [name, lat, lng, setCityCentre])

    return null
}
