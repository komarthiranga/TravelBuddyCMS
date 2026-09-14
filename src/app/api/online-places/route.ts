import { getSelectedCity } from '@/site/lib/selected-city'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
const queries: Record<string, string> = { attractions: 'tourist attractions', restaurants: 'restaurants', hotels: 'hotels' }
const budget = globalThis as typeof globalThis & { placesPreviewBudget?: { since: number; count: number } }
const headers = { 'Cache-Control': 'private, no-store, max-age=0' }
function safeUrl(value: unknown) {
    if (typeof value !== 'string') return null
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null } catch { return null }
}
type Attribution = { displayName?: string; uri?: string; photoUri?: string; provider?: string; providerUri?: string }
type Place = { id: string; displayName?: { text?: string }; formattedAddress?: string; googleMapsUri?: string; attributions?: Attribution[]; photos?: { name?: string; googleMapsUri?: string; authorAttributions?: Attribution[] }[] }

export async function POST(request: NextRequest) {
    // This preview is deliberately unavailable in production, even with configured keys.
    const host = request.headers.get('host') ?? ''
    if (process.env.NODE_ENV === 'production' || !/^(localhost|127\.0\.0\.1):\d+$/.test(host) || request.headers.get('origin') !== `http://${host}`) {
        return Response.json({ error: 'Local preview only.' }, { status: 403, headers })
    }
    const key = process.env.GOOGLE_PLACES_API_KEY
    if (!key) return Response.json({ error: 'Google Places key is not configured.' }, { status: 503, headers })
    let category: string
    try { const body = await request.json(); category = body.category } catch { return Response.json({ error: 'Invalid request.' }, { status: 400, headers }) }
    if (!Object.hasOwn(queries, category)) return Response.json({ error: 'Choose a supported category.' }, { status: 400, headers })
    const now = Date.now()
    if (!budget.placesPreviewBudget || now - budget.placesPreviewBudget.since > 3600000) budget.placesPreviewBudget = { since: now, count: 0 }
    if (budget.placesPreviewBudget.count >= 12) return Response.json({ error: 'Preview limit reached. Please try again in an hour.' }, { status: 429, headers })
    budget.placesPreviewBudget.count++
    async function google(url: string, options: RequestInit = {}) {
        const response = await fetch(url, { ...options, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000), headers: { ...options.headers, 'X-Goog-Api-Key': key! } })
        if (!response.ok) throw new Error(`Google returned ${response.status}`)
        return response.json()
    }
    try {
        const { city } = await getSelectedCity()
        if (!city) return Response.json({ error: 'Please choose a city first.' }, { status: 400, headers })
        const data = await google('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.photos,places.attributions' },
            body: JSON.stringify({ textQuery: `${queries[category]} in ${city.name}, ${city.state}, ${city.country}`, pageSize: 4, languageCode: 'en' }),
        })
        const places = await Promise.all(((data.places ?? []) as Place[]).slice(0, 4).map(async place => {
            const photo = place.photos?.[0]
            let image: string | null = null
            if (photo?.name && /^places\/[a-zA-Z0-9_-]+\/photos\/[a-zA-Z0-9_-]+$/.test(photo.name)) {
                try {
                    const media = await google(`https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=640&skipHttpRedirect=true`)
                    const candidate = safeUrl(media.photoUri)
                    if (candidate && new URL(candidate).hostname.endsWith('.googleusercontent.com')) image = candidate
                } catch { /* A photo failure must not hide the place. */ }
            }
            return {
                id: place.id, name: place.displayName?.text ?? 'Unnamed place', address: place.formattedAddress ?? 'Address unavailable',
                mapsUrl: safeUrl(place.googleMapsUri), image, photoSourceUrl: safeUrl(photo?.googleMapsUri),
                authors: (photo?.authorAttributions ?? []).map(author => ({ name: author.displayName ?? 'Photo contributor', url: safeUrl(author.uri), avatar: safeUrl(author.photoUri) })),
                attributions: (place.attributions ?? []).map(item => ({ name: item.provider ?? 'Data provider', url: safeUrl(item.providerUri) })),
            }
        }))
        return Response.json({ places }, { headers })
    } catch {
        return Response.json({ error: 'Google Places could not load right now. Check the API quota and connection, then try again.' }, { status: 502, headers })
    }
}
