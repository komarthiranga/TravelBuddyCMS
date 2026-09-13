import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import nextServer from 'next/server.js'
const { NextRequest, NextResponse } = nextServer

// Exercise the real handler with isolated upstream failures; never call map providers.
const source = ts.transpileModule(
    fs.readFileSync('src/app/api/directions/route.ts', 'utf8'),
    {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
        },
    },
).outputText
function handler(fetch, withGoogle = false) {
    const exports = {}
    vm.runInNewContext(source, {
        exports,
        require: (name) =>
            name === 'next/server' ? { NextRequest, NextResponse } : {},
        fetch,
        URL,
        AbortSignal,
        process: {
            env: withGoogle
                ? { GOOGLE_MAPS_API_KEY: 'test-only-placeholder' }
                : {},
        },
    })
    return exports.GET
}
const request = (query) =>
    new NextRequest(`http://localhost/api/directions?${query}`)
const valid = 'fromLat=16&fromLng=81&toLat=17&toLng=82'

test('rejects invalid latitude, partial numbers and missing coordinates before fetching', async () => {
    const get = handler(() => {
        throw new Error('Network must not be called')
    })
    for (const query of [
        '',
        `${valid}&mode=car`.replace('fromLat=16', 'fromLat=91'),
        valid.replace('fromLat=16', 'fromLat=16junk'),
    ]) {
        const response = await get(request(query))
        assert.equal(response.status, 400)
    }
})

test('provider HTTP failures produce unavailable, never fabricated route points', async () => {
    const get = handler(async () => ({ ok: false }), true)
    const response = await get(request(`${valid}&mode=car`))
    assert.equal(response.status, 503)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    const body = await response.json()
    assert.equal(typeof body.error, 'string')
    assert.equal(body.points, undefined)
    assert.equal(body.minutes, undefined)
})

test('network exceptions also produce a recoverable unavailable response', async () => {
    const get = handler(async () => {
        throw new Error('Upstream timeout')
    }, true)
    assert.equal((await get(request(`${valid}&mode=car`))).status, 503)
})

test('walking, cycling and bus requests never fall back to the driving-only provider', async () => {
    let calls = 0
    const get = handler(async () => {
        calls++
        return { ok: false }
    })
    for (const mode of ['walk', 'cycle', 'bus']) {
        assert.equal((await get(request(`${valid}&mode=${mode}`))).status, 503)
    }
    assert.equal(calls, 0)
})
