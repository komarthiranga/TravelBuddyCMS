import { CATEGORIES, searchPlaces, probeFoursquarePhoto, summarize } from './places/providers.mjs'

const args = process.argv.slice(2)
if (args.includes('--help')) {
    console.log('npm run places:compare -- [--run] [--provider=google|foursquare|both] [--city=Eluru, Andhra Pradesh, India] [--photos]\nDefault is a dry run. --photos probes up to 2 Foursquare places per category. No images or listings are saved.')
    process.exit(0)
}
const supported = /^(--run|--photos|--provider=(google|foursquare|both)|--city=.{1,120})$/
if (args.some(arg => !supported.test(arg))) { console.error('Invalid option. Use --help.'); process.exit(1) }
const city = args.find(a => a.startsWith('--city='))?.slice(7) ?? 'Eluru, Andhra Pradesh, India'
const selected = args.find(a => a.startsWith('--provider='))?.slice(11) ?? 'both'
const providers = selected === 'both' ? ['google', 'foursquare'] : [selected]
const keys = { google: process.env.GOOGLE_PLACES_API_KEY, foursquare: process.env.FOURSQUARE_API_KEY }
console.log(`Places pilot: ${city}. Top 5 results per category; this is a sample, not a full city inventory.`)
console.log('Google: at most 3 Text Search Pro requests. Foursquare: at most 3 searches, plus 6 photo lookups with --photos. No pagination or retries.')
console.log('No DB writes, image downloads, raw-response files, or Cloudinary uploads. Provider data exists only in memory. Output contains aggregate measurements only.')
for (const provider of providers) console.log(`${provider}: ${keys[provider]?.trim() ? 'configured' : 'missing key'}`)
if (!args.includes('--run')) { console.log('Dry run: no API calls. Add keys to .env.local, then use --run. Provider billing may apply.'); process.exit(0) }
let failed = false
for (const provider of providers) {
    let photoLookupsStopped = false
    if (!keys[provider]?.trim()) { console.log(`${provider}: skipped — key missing`); failed = true; continue }
    for (const category of CATEGORIES) {
        const start = performance.now()
        try {
            const places = await searchPlaces({ provider, key: keys[provider], city, category })
            let photoProbeErrors = 0
            if (provider === 'foursquare' && args.includes('--photos') && !photoLookupsStopped) {
                for (const place of places.slice(0, 2)) {
                    try { place.photoAvailable = await probeFoursquarePhoto(place.id, keys[provider]) }
                    catch (error) { photoProbeErrors++; failed = true; photoLookupsStopped = true; console.log(`${provider}: photo probes stopped — ${error.message}`); break }
                }
            }
            console.log(JSON.stringify({ provider, category, ...summarize(places), photoProbeErrors, elapsedMs: Math.round(performance.now() - start) }))
        } catch (error) {
            console.log(`${provider}/${category}: ${error.message}`)
            failed = true
            break // Stop this provider on failure to avoid spending more quota.
        }
    }
}
console.log('Counts do not establish accuracy, relevance, photo quality, or freshness. Inspect a small live sample in the provider console before selection.')
process.exitCode = failed ? 1 : 0
