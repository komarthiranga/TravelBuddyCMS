import { NextRequest } from 'next/server'
import { categories, searchTypes, validPlaceId, validPosition, type Category } from '@/site/online/model'
import { DiscoveryError, findCities, findPlaces, getPhoto, getPlace, resolveCity } from '@/site/online/google'
import { allowClient } from '@/site/online/limits'

export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store, max-age=0' }
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers })
export async function POST(request: NextRequest) {
    if (request.headers.get('origin') !== request.nextUrl.origin) return reply({ error: 'Please search from TravelBuddy.' }, 403)
    if (!allowClient(request.headers.get('x-forwarded-for')?.split(',')[0] || 'local')) return reply({ error: 'Please wait a minute before searching again.' }, 429)
    try {
        const text = await request.text()
        if (text.length > 8000) return reply({ error: 'Request is too large.' }, 413)
        let body
        try { body = JSON.parse(text) } catch { return reply({ error: 'Invalid request.' }, 400) }
        if (!body || typeof body !== 'object') return reply({ error: 'Invalid request.' }, 400)
        if (body.action === 'cities') {
            if (typeof body.query !== 'string' || body.query.trim().length < 3 || body.query.length > 100 || typeof body.sessionToken !== 'string' || !/^[a-zA-Z0-9_-]{1,36}$/.test(body.sessionToken)) return reply({ error: 'Enter at least 3 letters of an Indian city.' }, 400)
            return reply({ cities: await findCities(body.query.trim(), body.sessionToken) })
        }
        if (body.action === 'city' && validPlaceId(body.id)) {
            if (body.sessionToken !== undefined && (typeof body.sessionToken !== 'string' || !/^[a-zA-Z0-9_-]{1,36}$/.test(body.sessionToken))) return reply({ error: 'Invalid search session.' }, 400)
            const { city } = await resolveCity(body.id, body.sessionToken)
            return reply({ city })
        }
        if (body.action === 'search' && (validPlaceId(body.cityId) || validPosition(body.position)) && categories.some(c => c.id === body.category)) {
            if (body.position !== undefined && !validPosition(body.position)) return reply({ error: 'Your location could not be read. Please choose a city.' }, 400)
            if (body.type && !searchTypes[body.category as Category].includes(body.type)) return reply({ error: 'Choose a supported category.' }, 400)
            return reply(await findPlaces(body.cityId || null, body.category, body.type, body.position))
        }
        if (body.action === 'details' && validPlaceId(body.id)) return reply({ place: await getPlace(body.id) })
        if (body.action === 'photo' && typeof body.name === 'string' && /^places\/[A-Za-z0-9_-]{5,255}\/photos\/[A-Za-z0-9_-]{1,5000}$/.test(body.name)) return reply({ url: await getPhoto(body.name) })
        return reply({ error: 'Choose a valid city, category or place.' }, 400)
    } catch (cause) {
        return reply({ error: cause instanceof DiscoveryError ? cause.message : 'Online discovery is unavailable. Please try again.' }, cause instanceof DiscoveryError ? cause.status : 502)
    }
}
