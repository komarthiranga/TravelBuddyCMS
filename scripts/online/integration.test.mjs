// Run against a local dev server. Uses isolated test users and no paid Google calls.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import postgres from 'postgres'
import { encode } from 'next-auth/jwt'

const base = 'http://localhost:3000'
const request = async (path, { token, body, origin = base, method = body ? 'POST' : 'GET' } = {}) => {
    const response = await fetch(`${base}${path}`, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(token ? { Cookie: `authjs.session-token=${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
    return { status: response.status, cache: response.headers.get('cache-control'), body: await response.json() }
}
test('input validation and unauthenticated saves fail before provider/database writes', async () => {
    assert.equal((await request('/api/user-places')).status, 401)
    assert.equal((await request('/api/user-places', { body: { placeId: 'ChIJTESTPLACE', field: 'saved', value: true } })).status, 401)
    assert.equal((await request('/api/discovery', { origin: 'https://untrusted.example', body: { action: 'cities', query: 'Eluru' } })).status, 403)
    assert.equal((await request('/api/discovery', { body: { action: 'cities', query: 'E', sessionToken: 'test' } })).status, 400)
    assert.equal((await request('/api/discovery', { body: { action: 'search', cityId: 'ChIJTESTPLACE', category: 'food', type: 'unknown' } })).status, 400)
    assert.equal((await request('/api/discovery', { body: { action: 'details', id: '../secrets' } })).status, 400)
    assert.equal((await request('/api/discovery', { body: { action: 'photo', name: 'https://evil.example' } })).status, 400)
})
test('saved/liked state persists independently and is isolated by authenticated user', async () => {
    if (!process.env.AUTH_SECRET || !process.env.DATABASE_URL) throw new Error('Load .env.local first')
    const url = process.env.DATABASE_URL
    const sql = postgres(url, { ssl: /localhost|127\.0\.0\.1/.test(url) ? false : 'require', max: 1 })
    const a = `test-${randomUUID()}`, b = `test-${randomUUID()}`
    const token = id => encode({ token: { sub: id, name: 'Integration Test', email: 'test@example.invalid' }, secret: process.env.AUTH_SECRET, salt: 'authjs.session-token', maxAge: 300 })
    try {
        await sql`insert into traveller (id, name, email) values (${a}, 'Integration Test', 'test@example.invalid'), (${b}, 'Integration Test', 'test@example.invalid')`
        const tokenA = await token(a), tokenB = await token(b)
        const placeId = 'ChIJTESTPLACE'
        const change = (field, value) => request('/api/user-places', { token: tokenA, body: { placeId, field, value, userId: b } })
        assert.equal((await change('saved', true)).status, 200)
        assert.equal((await change('liked', true)).status, 200)
        const first = await request('/api/user-places', { token: await token(a) })
        assert.match(first.cache, /no-store/)
        assert.deepEqual(first.body.places, [{ place_id: placeId, saved: true, liked: true }])
        assert.deepEqual((await request('/api/user-places', { token: tokenB })).body.places, [])
        await change('saved', false)
        assert.deepEqual((await request('/api/user-places', { token: tokenA })).body.places, [{ place_id: placeId, saved: false, liked: true }])
        assert.equal((await request('/api/user-places', { token: tokenA, origin: 'https://untrusted.example', body: { placeId, field: 'liked', value: false } })).status, 403)
        assert.equal((await request('/api/user-places', { token: tokenA, method: 'DELETE', body: { confirmation: 'no' } })).status, 400)
        await change('liked', false)
        assert.deepEqual((await request('/api/user-places', { token: tokenA })).body.places, [])
        await change('saved', true)
        assert.equal((await request('/api/user-places', { token: tokenA, method: 'DELETE', body: { confirmation: 'DELETE' } })).status, 200)
        const [remaining] = await sql`select count(*)::int as count from traveller_place where user_id=${a}`
        assert.equal(remaining.count, 0)
    } finally {
        await sql`delete from traveller where id in (${a}, ${b})`
        await sql.end()
    }
})
