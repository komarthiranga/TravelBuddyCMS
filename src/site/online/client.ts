export async function discovery<T>(body: unknown, signal?: AbortSignal): Promise<T> {
    const response = await fetch('/api/discovery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal, cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Online discovery is unavailable.')
    return data
}
