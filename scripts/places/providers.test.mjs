import { test } from 'node:test'
import assert from 'node:assert/strict'
import { searchPlaces, summarize, probeFoursquarePhoto, probeGooglePhoto } from './providers.mjs'
const base = { provider: 'google', key: 'test-secret', city: 'Eluru', category: 'restaurants' }
const response = data => new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } })
test('Google masks requested fields and handles missing photo metadata', async () => {
    const places = await searchPlaces({ ...base, fetcher: async (url, options) => {
        assert.equal(new URL(url).hostname, 'places.googleapis.com')
        assert.equal(options.headers['X-Goog-Api-Key'], 'test-secret')
        assert.ok(!options.headers['X-Goog-FieldMask'].includes('*'))
        assert.equal(JSON.parse(options.body).pageSize, 5)
        assert.equal(options.redirect, 'error')
        return response({ places: [{ id: 'abc', displayName: { text: 'Example' }, location: { latitude: 0, longitude: 0 } }] })
    } })
    assert.equal(places[0].hasCoordinates, true)
    assert.equal(places[0].photoAvailable, false)
    assert.equal(summarize(places).withAddress, 0)
})
test('Foursquare maps documented address fields and distinguishes unchecked photos', async () => {
    const places = await searchPlaces({ ...base, provider: 'foursquare', fetcher: async (url, options) => {
        assert.equal(new URL(url).searchParams.get('near'), 'Eluru')
        assert.equal(options.headers.Authorization, 'Bearer test-secret')
        return response({ results: [{ fsq_place_id: 'abc', name: 'Example', location: { address: 'Street', locality: 'Eluru' }, latitude: 1, longitude: 2 }] })
    } })
    assert.equal(places[0].address, 'Street, Eluru')
    assert.equal(summarize(places).photoNotChecked, 1)
    assert.equal(summarize(places).photoMissing, 0)
})
test('missing credentials and invalid input never call upstream', async () => {
    const fetcher = () => assert.fail('unexpected network request')
    await assert.rejects(searchPlaces({ ...base, key: '', fetcher }), /Missing/)
    await assert.rejects(searchPlaces({ ...base, limit: 50, fetcher }), /Limit/)
    await assert.rejects(probeFoursquarePhoto('../escape', 'key', fetcher), /Invalid/)
})
test('provider errors omit response bodies and are not retried', async () => {
    let requests = 0
    await assert.rejects(searchPlaces({ ...base, fetcher: async () => { requests++; return new Response('test-secret', { status: 429 }) } }), error => error.message.includes('429') && !error.message.includes('test-secret'))
    assert.equal(requests, 1)
    await assert.rejects(searchPlaces({ ...base, fetcher: async () => { throw new Error('test-secret') } }), error => !error.message.includes('test-secret'))
})
test('Google photo probe rejects untrusted destinations before fetching image', async () => {
    let requests = 0
    await assert.rejects(probeGooglePhoto('abc', 'key', async () => {
        requests++
        return response(requests === 1 ? { photos: [{ name: 'places/abc/photos/def' }] } : { photoUri: 'https://example.com/image.jpg' })
    }), /Unexpected photo host/)
    assert.equal(requests, 2)
})
test('Google image fetch does not forward API credentials', async () => {
    let requests = 0
    const result = await probeGooglePhoto('abc', 'key', async (url, options) => {
        requests++
        if (requests === 1) return response({ photos: [{ name: 'places/abc/photos/def' }] })
        if (requests === 2) return response({ photoUri: 'https://lh3.googleusercontent.com/image' })
        assert.equal(options.headers, undefined)
        return new Response('image', { headers: { 'content-type': 'image/jpeg' } })
    })
    assert.equal(result.imageVerified, true)
})
