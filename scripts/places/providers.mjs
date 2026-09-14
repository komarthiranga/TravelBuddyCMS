// Node-only evaluation adapters. Never import these into a browser bundle.
export const CATEGORIES = ['attractions', 'restaurants', 'hotels']
const queries = { attractions: 'tourist attractions', restaurants: 'restaurants', hotels: 'hotels' }

async function json(url, options, fetcher) {
    let response
    try {
        response = await fetcher(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(10000) })
    } catch {
        throw new Error('Provider connection failed or timed out. No automatic retry was made.')
    }
    // Do not log upstream bodies or exceptions: they may contain credentials.
    if (!response.ok) throw new Error(`Provider HTTP ${response.status}. Check credentials, access and quota.`)
    try { return await response.json() } catch { throw new Error('Provider returned invalid JSON.') }
}

export async function searchPlaces({ provider, key, city, category, limit = 5, fetcher = fetch }) {
    if (!['google', 'foursquare'].includes(provider)) throw new Error('Unknown provider')
    if (!CATEGORIES.includes(category)) throw new Error('Unknown category')
    if (!key?.trim()) throw new Error('Missing provider key')
    if (typeof city !== 'string' || !city.trim() || city.length > 120) throw new Error('Invalid city')
    if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error('Limit must be 1–10')
    if (provider === 'google') {
        const data = await json('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.photos' },
            body: JSON.stringify({ textQuery: `${queries[category]} in ${city}`, pageSize: limit, languageCode: 'en' }),
        }, fetcher)
        if (data.places !== undefined && !Array.isArray(data.places)) throw new Error('Unexpected Google response')
        return (data.places ?? []).slice(0, limit).map(place => ({
            id: place.id, name: place.displayName?.text ?? '', address: place.formattedAddress ?? '',
            hasCoordinates: Number.isFinite(place.location?.latitude) && Number.isFinite(place.location?.longitude),
            photoAvailable: Array.isArray(place.photos) && place.photos.length > 0,
        }))
    }
    const url = new URL('https://places-api.foursquare.com/places/search')
    url.search = new URLSearchParams({ near: city, query: queries[category], limit: String(limit), fields: 'fsq_place_id,name,location,latitude,longitude' }).toString()
    const data = await json(url, { headers: fsqHeaders(key) }, fetcher)
    if (!Array.isArray(data.results)) throw new Error('Unexpected Foursquare response')
    return data.results.slice(0, limit).map(place => ({
        id: place.fsq_place_id, name: place.name ?? '', address: [place.location?.address, place.location?.locality, place.location?.region, place.location?.postcode, place.location?.country].filter(Boolean).join(', '),
        hasCoordinates: Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
        photoAvailable: null, // Requires a separate photo lookup; unknown is not false.
    }))
}

function fsqHeaders(key) {
    return { Authorization: `Bearer ${key}`, 'X-Places-Api-Version': '2025-06-17', Accept: 'application/json' }
}

export async function probeFoursquarePhoto(id, key, fetcher = fetch) {
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw new Error('Invalid provider place ID')
    const data = await json(`https://places-api.foursquare.com/places/${encodeURIComponent(id)}/photos?limit=1`, { headers: fsqHeaders(key) }, fetcher)
    if (!Array.isArray(data)) throw new Error('Unexpected photo response')
    return data.length > 0
}

export function summarize(places) {
    return {
        returned: places.length,
        withName: places.filter(p => p.name).length,
        withAddress: places.filter(p => p.address).length,
        withCoordinates: places.filter(p => p.hasCoordinates).length,
        photoAvailable: places.filter(p => p.photoAvailable === true).length,
        photoMissing: places.filter(p => p.photoAvailable === false).length,
        photoNotChecked: places.filter(p => p.photoAvailable === null).length,
    }
}

/** Retrieve a fresh photo reference, then verify an image response without saving it. */
export async function probeGooglePhoto(id, key, fetcher = fetch) {
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,256}$/.test(id)) throw new Error('Invalid provider place ID')
    const details = await json(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
        headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'photos' },
    }, fetcher)
    const photo = details.photos?.[0]
    if (!photo) return { available: false, imageVerified: false }
    if (typeof photo.name !== 'string' || !/^places\/[a-zA-Z0-9_-]+\/photos\/[a-zA-Z0-9_-]+$/.test(photo.name)) throw new Error('Invalid photo reference')
    const media = await json(`https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=320&skipHttpRedirect=true`, {
        headers: { 'X-Goog-Api-Key': key },
    }, fetcher)
    let url
    try { url = new URL(media.photoUri) } catch { throw new Error('Invalid photo URL') }
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.googleusercontent.com') || url.username || url.password || url.port) throw new Error('Unexpected photo host')
    let image
    try { image = await fetcher(url, { redirect: 'error', signal: AbortSignal.timeout(10000) }) }
    catch { throw new Error('Photo download failed or timed out') }
    const contentType = image.headers.get('content-type') ?? ''
    const imageVerified = image.ok && contentType.startsWith('image/')
    await image.body?.cancel()
    return { available: true, imageVerified, contentType, status: image.status }
}
