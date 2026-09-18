// Development backstop, not a billing cap. Set Google Cloud quotas before public launch.
const state = globalThis as typeof globalThis & { onlineBudget?: { day: string; calls: number; clients: Map<string, { since: number; count: number }> } }
function budget() {
    const day = new Date().toISOString().slice(0, 10)
    if (state.onlineBudget?.day !== day) state.onlineBudget = { day, calls: 0, clients: new Map() }
    return state.onlineBudget!
}
export function consumeProviderCall(): boolean {
    const raw = Number(process.env.PLACES_DAILY_CALL_LIMIT || 100)
    const max = Number.isInteger(raw) && raw >= 0 ? raw : 100
    const b = budget()
    if (b.calls >= max) return false
    b.calls++
    return true
}
export function allowClient(key: string): boolean {
    const b = budget(), now = Date.now()
    for (const [id, value] of b.clients) if (now - value.since >= 60000) b.clients.delete(id)
    const client = b.clients.get(key) || { since: now, count: 0 }
    if (client.count >= 20 || (!b.clients.has(key) && b.clients.size >= 2000)) return false
    client.count++; b.clients.set(key, client)
    return true
}
