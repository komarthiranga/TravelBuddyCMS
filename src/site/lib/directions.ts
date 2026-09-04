import type { RouteWaypoint } from '@/site/lib/waypoints'

export type DirectionsResult = {
    points: { lat: number; lng: number }[]
    /** Road distance in kilometres. */
    km: number
    /** Typical duration in minutes. */
    minutes: number
    provider: 'google' | 'osm'
    /** Named pointers along the ride, start to destination. */
    waypoints: RouteWaypoint[]
}
