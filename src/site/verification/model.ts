export const fields = ['name', 'address', 'coordinates', 'hours', 'admission'] as const
export type Field = typeof fields[number]
export type Evidence = { field: Field; value: unknown; status: string; source_url: string; checked_at: string; review_due_at: string; notes?: string }
export type Verification = { status: 'verified' | 'partial' | 'unverified'; checks: Evidence[]; pending: Field[]; issues: Evidence[] }
export type Reviewable = {
    short_name: string; address: string; category_name: string
    latitude: string | null; longitude: string | null
    opening_time: string | null; closing_time: string | null
    entry_fee: string | null; currency_code: string
}
export function pricingKind(category: string) {
    if (/grocer|milk.*delivery/i.test(category)) return 'retail'
    if (/restaurant|cafe|café|quick bites|food/i.test(category)) return 'food'
    if (/hotel|stay|guest house/i.test(category)) return 'stay'
    return 'admission'
}
export function values(place: Reviewable): Record<Field, unknown> {
    return { name: place.short_name, address: place.address,
        coordinates: [place.latitude, place.longitude], hours: [place.opening_time, place.closing_time],
        admission: [place.entry_fee, place.currency_code] }
}
export function review(place: Reviewable, evidence: Evidence[], now = Date.now()): Verification {
    const current = values(place)
    const required = fields.filter(field => field !== 'admission' || pricingKind(place.category_name) === 'admission')
    const checks = required.flatMap(field => {
        // The newest review supersedes older evidence, including conflict/pending records.
        const newest = evidence.filter(e => e.field === field).sort((a,b) => Date.parse(b.checked_at) - Date.parse(a.checked_at))[0]
        if (!newest || newest.status !== 'verified' || !/^https:\/\//.test(newest.source_url)
            || !(Date.parse(newest.checked_at) <= now && Date.parse(newest.review_due_at) > now)
            || JSON.stringify(newest.value) !== JSON.stringify(current[field])) return []
        if ((field === 'hours' && (!place.opening_time || !place.closing_time))
            || (field === 'coordinates' && (!place.latitude || !place.longitude))
            || (field === 'admission' && (place.entry_fee === null || !Number.isFinite(Number(place.entry_fee)) || Number(place.entry_fee) < 0))) return []
        return [newest]
    })
    const pending = required.filter(field => !checks.some(e => e.field === field))
    const issues = pending.flatMap(field => {
        const latest = evidence.filter(e => e.field === field).sort((a,b) => Date.parse(b.checked_at) - Date.parse(a.checked_at))[0]
        return latest && (latest.status === 'pending' || latest.status === 'conflict') && latest.notes
            && /^https:\/\//.test(latest.source_url) && Date.parse(latest.checked_at) <= now && Date.parse(latest.review_due_at) > now
            && JSON.stringify(latest.value) === JSON.stringify(current[field]) ? [latest] : []
    })
    return { status: pending.length === 0 ? 'verified' : checks.length ? 'partial' : 'unverified', checks, pending, issues }
}
export function priceLabel(place: { category_name: string; entry_fee: string | null; currency_code: string; verification: Verification }) {
    const kind = pricingKind(place.category_name)
    if (kind === 'retail') return { en: 'Check product prices', te: 'ఉత్పత్తుల ధరలను తెలుసుకోండి' }
    if (kind === 'food') return { en: 'Menu prices vary', te: 'మెనూ ధరలు మారవచ్చు' }
    if (kind === 'stay') return { en: 'Check room rates', te: 'గది ధరలను తెలుసుకోండి' }
    if (!place.verification.checks.some(e => e.field === 'admission')) return { en: 'Entry fee not confirmed', te: 'ప్రవేశ రుసుము నిర్ధారించలేదు' }
    const amount = Number(place.entry_fee)
    return amount === 0 ? { en: 'Free entry', te: 'ఉచిత ప్రవేశం' }
        : { en: `${place.currency_code === 'INR' ? '₹' : place.currency_code + ' '}${amount.toLocaleString('en-IN')}`, te: `${place.currency_code === 'INR' ? '₹' : place.currency_code + ' '}${amount.toLocaleString('en-IN')}` }
}
