export type StaySearch = { checkin: string; checkout: string; guests: number; rooms: number }
export type StaySearchParams = Record<string, string | string[] | undefined>

/** The destination's calendar date, not the server's UTC date. */
export function todayInIndia(now = new Date()): string {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
    return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)!.value).join('-')
}
export function validDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T00:00:00Z`)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
export function addDays(value: string, days: number): string {
    const date = new Date(`${value}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() + days)
    return date.toISOString().slice(0, 10)
}
export function stayNights(search: Pick<StaySearch, 'checkin' | 'checkout'>): number {
    return Math.round((Date.parse(`${search.checkout}T00:00:00Z`) - Date.parse(`${search.checkin}T00:00:00Z`)) / 86400000)
}
export function searchError(search: StaySearch, today: string): string | null {
    if (!validDate(search.checkin) || !validDate(search.checkout)) return 'Choose valid check-in and check-out dates.'
    if (search.checkin < today) return 'Check-in must be today or a future date.'
    if (search.checkin > addDays(today, 365)) return 'Choose a check-in within the next year.'
    if (search.checkout <= search.checkin) return 'Check-out must be after check-in.'
    if (stayNights(search) > 30) return 'Choose up to 30 nights. For a longer stay, contact the property.'
    if (!Number.isInteger(search.guests) || search.guests < 1 || search.guests > 16) return 'Choose between 1 and 16 adults.'
    if (!Number.isInteger(search.rooms) || search.rooms < 1 || search.rooms > search.guests) return 'Choose at least 1 room and no more rooms than adults.'
    return null
}
export function readStaySearch(params: StaySearchParams, today: string): StaySearch {
    const scalar = (key: string) => typeof params[key] === 'string' ? params[key] as string : ''
    const start = scalar('checkin')
    const checkin = validDate(start) && start >= today && start <= addDays(today, 365) ? start : today
    const end = scalar('checkout')
    const checkout = validDate(end) && end > checkin && end <= addDays(checkin, 30) ? end : addDays(checkin, 1)
    const rawGuests = Number(scalar('guests'))
    const guests = Number.isInteger(rawGuests) && rawGuests >= 1 && rawGuests <= 16 ? rawGuests : 1
    const rawRooms = Number(scalar('rooms'))
    const rooms = Number.isInteger(rawRooms) && rawRooms >= 1 && rawRooms <= guests ? rawRooms : 1
    return { checkin, checkout, guests, rooms }
}
export function staySearchQuery(search: StaySearch): string {
    return new URLSearchParams({ checkin: search.checkin, checkout: search.checkout, guests: String(search.guests), rooms: String(search.rooms) }).toString()
}
export function searchSummary(search: StaySearch): string {
    const date = (value: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
    const nights = stayNights(search)
    return `${date(search.checkin)} – ${date(search.checkout)} · ${nights} ${nights === 1 ? 'night' : 'nights'} · ${search.guests} ${search.guests === 1 ? 'adult' : 'adults'} · ${search.rooms} ${search.rooms === 1 ? 'room' : 'rooms'}`
}
