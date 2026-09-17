import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
const exports = {}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/site/stay/search.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports, URLSearchParams })
const { todayInIndia, readStaySearch, searchError, stayNights, staySearchQuery, addDays, validDate } = exports
const today = '2026-09-17'

test('today uses India time across the UTC midnight boundary', () => {
    assert.equal(todayInIndia(new Date('2026-09-16T18:29:00Z')), '2026-09-16')
    assert.equal(todayInIndia(new Date('2026-09-16T18:30:00Z')), today)
})
test('empty search defaults to today, one night, one adult and one room', () => {
    assert.equal(JSON.stringify(readStaySearch({}, today)), JSON.stringify({ checkin: today, checkout: '2026-09-18', guests: 1, rooms: 1 }))
})
test('custom search survives a query-string round trip', () => {
    const search = { checkin: '2026-09-30', checkout: '2026-10-03', guests: 3, rooms: 2 }
    const restored = readStaySearch(Object.fromEntries(new URLSearchParams(staySearchQuery(search))), today)
    assert.equal(JSON.stringify(restored), JSON.stringify(search))
    assert.equal(stayNights(restored), 3)
    assert.equal(searchError(restored, today), null)
})
test('invalid calendar dates, past dates, reversed dates and invalid occupancies are normalised', () => {
    for (const params of [
        { checkin: '2026-02-30', checkout: 'invalid', guests: '-1', rooms: '0' },
        { checkin: '2026-09-16', checkout: '2026-09-17', guests: '2.5', rooms: '100' },
        { checkin: ['2026-09-19'], checkout: '2026-09-17', guests: '99' },
        { checkin: '9999-01-01', checkout: '9999-01-02', guests: 'NaN' },
    ]) {
        const result = readStaySearch(params, today)
        assert.equal(searchError(result, today), null)
        assert.equal(result.checkin, today)
    }
})
test('calendar arithmetic handles leap days and year rollover', () => {
    assert.equal(validDate('2028-02-29'), true)
    assert.equal(validDate('2026-02-29'), false)
    assert.equal(addDays('2028-02-28', 1), '2028-02-29')
    assert.equal(addDays('2026-12-31', 1), '2027-01-01')
})
test('validation rejects stale, zero-night, overlong and over-roomed enquiries', () => {
    const base = { checkin: today, checkout: '2026-09-18', guests: 1, rooms: 1 }
    for (const changed of [
        { checkin: '2026-09-16' }, { checkout: today },
        { checkout: '2026-11-01' }, { rooms: 2 }, { guests: 0 },
    ]) assert.equal(typeof searchError({ ...base, ...changed }, today), 'string')
})
