// Download only; this script never connects to the database.
import { mkdir, writeFile, rename } from 'node:fs/promises'

const query = '[out:json][timeout:20];nwr["name"](16.66,81.04,16.76,81.15);out center tags;'
const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
]
let saved = false
for (const endpoint of endpoints) {
    try {
        console.log(`Downloading from ${new URL(endpoint).hostname}…`)
        const url = new URL(endpoint)
        url.searchParams.set('data', query)
        const response = await fetch(url, {
            headers: { 'User-Agent': 'TravelBuddy-EluruImport/1.0 (+https://travel-buddy-cms-xi.vercel.app/)' },
            signal: AbortSignal.timeout(35000),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (data.remark || !data.osm3s || !String(data.generator).includes('Overpass') || !Array.isArray(data.elements) || !data.elements.length) {
            throw new Error('Empty or incomplete Overpass export; existing file preserved')
        }
        await mkdir('data/imports', { recursive: true })
        const destination = 'data/imports/eluru-overpass.json'
        await writeFile(`${destination}.tmp`, JSON.stringify(data, null, 2))
        await rename(`${destination}.tmp`, destination)
        console.log(`Saved ${data.elements.length} map records to ${destination}. No database changes.`)
        saved = true
        break
    } catch (error) {
        console.error(`${new URL(endpoint).hostname}: ${error.message}`)
    }
}
if (!saved) {
    console.error('Download unavailable. Try again later; no import file was replaced and no database changes were made.')
    process.exitCode = 1
}
