import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validPlaceId, safeHttps, validPosition } from '../../src/site/online/model.ts'
import { consumeProviderCall, allowClient } from '../../src/site/online/limits.ts'

test('external identifiers and links cannot carry paths or executable schemes', () => {
    assert.equal(validPlaceId('ChIJWa6mLswUNjoRGzX_icg3MC4'), true)
    for (const id of ['', null, '../secret', 'id?key=secret', 'x'.repeat(256)]) assert.equal(validPlaceId(id), false)
    assert.equal(safeHttps('javascript:alert(1)'), null)
    assert.equal(safeHttps('https://user:pass@example.com'), null)
    assert.equal(safeHttps('//maps.google.com/example'), 'https://maps.google.com/example')
})
test('request backstops reject bursts and stop provider calls at the configured cap', () => {
    const before = process.env.PLACES_DAILY_CALL_LIMIT
    try {
        process.env.PLACES_DAILY_CALL_LIMIT = '2'
        assert.equal(consumeProviderCall(), true)
        assert.equal(consumeProviderCall(), true)
        assert.equal(consumeProviderCall(), false)
        process.env.PLACES_DAILY_CALL_LIMIT = '0'
        assert.equal(consumeProviderCall(), false)
        for (let i = 0; i < 20; i++) assert.equal(allowClient('test-client'), true)
        assert.equal(allowClient('test-client'), false)
    } finally {
        if (before === undefined) delete process.env.PLACES_DAILY_CALL_LIMIT
        else process.env.PLACES_DAILY_CALL_LIMIT = before
    }
})

test('nearby search only accepts finite geographic coordinates', () => {
    assert.equal(validPosition({ latitude: 16.7107, longitude: 81.0952 }), true)
    for (const value of [null, {}, { latitude: '16', longitude: 81 }, { latitude: 91, longitude: 81 }, { latitude: 16, longitude: 181 }, { latitude: NaN, longitude: 81 }, { latitude: 16, longitude: Infinity }]) assert.equal(validPosition(value), false)
})
