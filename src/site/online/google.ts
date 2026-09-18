import 'server-only'
import { categories, safeHttps, type City, type OnlinePlace, type Position } from './model'
import { distanceKm } from '@/site/lib/geo'
import { consumeProviderCall } from './limits'

type GooglePlace = {
    id: string; displayName?: { text?: string }; formattedAddress?: string; primaryType?: string; types?: string[]
    addressComponents?: { shortText?: string; types?: string[] }[]; location?: { latitude: number; longitude: number }
    googleMapsUri?: string; rating?: number; userRatingCount?: number; businessStatus?: string
    currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] }; nationalPhoneNumber?: string; websiteUri?: string; priceLevel?: string
    photos?: { name: string; authorAttributions?: { displayName?: string; uri?: string }[] }[]
    attributions?: { provider?: string; providerUri?: string }[]
}
export class DiscoveryError extends Error {
    constructor(message: string, public status = 502) { super(message) }
}
async function google(path: string, fields: string | null, body?: unknown) {
    const key = process.env.GOOGLE_PLACES_API_KEY
    if (!key) throw new DiscoveryError('Online discovery is not connected yet.', 503)
    if (!consumeProviderCall()) throw new DiscoveryError('Today’s discovery limit has been reached. Please try again tomorrow.', 429)
    const response = await fetch(`https://places.googleapis.com/v1/${path}`, {
        method: body ? 'POST' : 'GET', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { 'X-Goog-Api-Key': key, ...(fields ? { 'X-Goog-FieldMask': fields } : {}), 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    })
    if (!response.ok) {
        console.warn('Google Places request failed', { status: response.status })
        throw new DiscoveryError(response.status === 429 ? 'Online discovery is busy. Please try again shortly.' : 'Online places could not load. Please try again shortly.', response.status === 429 ? 429 : 502)
    }
    return response.json()
}
const inIndia = (place: GooglePlace) => place.addressComponents?.some(c => c.types?.includes('country') && c.shortText === 'IN')
function normalize(place: GooglePlace): OnlinePlace {
    const photo = place.photos?.[0]
    return {
        id: place.id, name: place.displayName?.text || 'Unnamed place', address: place.formattedAddress || '',
        type: place.primaryType || place.types?.[0] || 'point_of_interest', types: place.types || [], mapsUrl: safeHttps(place.googleMapsUri),
        rating: place.rating, reviews: place.userRatingCount, hours: place.currentOpeningHours?.weekdayDescriptions,
        open: place.currentOpeningHours?.openNow, phone: place.nationalPhoneNumber, website: safeHttps(place.websiteUri),
        priceLevel: place.priceLevel, businessStatus: place.businessStatus,
        photo: photo ? { name: photo.name, authors: (photo.authorAttributions || []).map(a => ({ name: a.displayName || 'Photo contributor', url: safeHttps(a.uri) })) } : undefined,
        attributions: (place.attributions || []).map(a => ({ name: a.provider || 'Data provider', url: safeHttps(a.providerUri) })),
    }
}
export async function findCities(input: string, sessionToken: string): Promise<City[]> {
    const data = await google('places:autocomplete', null, { input, includedRegionCodes: ['in'], includedPrimaryTypes: ['(cities)'], languageCode: 'en', sessionToken })
    return (data.suggestions || []).flatMap((s: { placePrediction?: { placeId: string; text?: { text?: string }; structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } } } }) => {
        const p = s.placePrediction
        return p ? [{ id: p.placeId, name: p.structuredFormat?.mainText?.text || p.text?.text || '', address: p.structuredFormat?.secondaryText?.text || '' }] : []
    })
}
export async function resolveCity(id: string, sessionToken?: string) {
    const p: GooglePlace = await google(`places/${id}?languageCode=en${sessionToken ? `&sessionToken=${encodeURIComponent(sessionToken)}` : ''}`, 'id,displayName,formattedAddress,location,addressComponents,types')
    if (!inIndia(p) || !p.location || !p.types?.some(t => ['locality', 'administrative_area_level_3'].includes(t))) throw new DiscoveryError('Please choose a city in India.', 400)
    return { city: { id: p.id, name: p.displayName?.text || '', address: p.formattedAddress || '' }, location: p.location }
}
export async function findPlaces(cityId: string | null, category: string, type?: string, position?: Position) {
    if (position && (position.latitude < 6 || position.latitude > 38 || position.longitude < 68 || position.longitude > 98)) throw new DiscoveryError('Nearby discovery is currently available in India. Choose an Indian city to explore instead.', 400)
    const { city, location } = position ? { city: null, location: position } : await resolveCity(cityId!)
    const defaultType = categories.find(c => c.id === category)?.type || 'tourist_attraction'
    const data = await google('places:searchNearby', 'places.id,places.displayName,places.formattedAddress,places.addressComponents,places.primaryType,places.types,places.googleMapsUri,places.attributions,places.location', {
        includedTypes: [type || defaultType], maxResultCount: 10, languageCode: 'en',
        locationRestriction: { circle: { center: location, radius: 15000 } },
        ...(position ? { rankPreference: 'DISTANCE' } : {}),
    })
    return { city, places: ((data.places || []) as GooglePlace[]).filter(inIndia).map(p => ({ ...normalize(p), ...(p.location ? { distanceKm: distanceKm({ lat: location.latitude, lng: location.longitude }, { lat: p.location.latitude, lng: p.location.longitude }) } : {}) })) }
}
export async function getPlace(id: string) {
    const p: GooglePlace = await google(`places/${id}?languageCode=en`, 'id,displayName,formattedAddress,addressComponents,primaryType,types,googleMapsUri,attributions,rating,userRatingCount,currentOpeningHours,nationalPhoneNumber,websiteUri,priceLevel,businessStatus,photos')
    if (!inIndia(p)) throw new DiscoveryError('Only places in India are available.', 400)
    return normalize(p)
}
export async function getPhoto(name: string) {
    const data = await google(`${name}/media?maxWidthPx=800&skipHttpRedirect=true`, null)
    const url = safeHttps(data.photoUri)
    if (!url || !new URL(url).hostname.endsWith('.googleusercontent.com')) throw new DiscoveryError('This photo is unavailable.')
    return url
}
