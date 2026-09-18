export async function POST() {
    return Response.json({ error: 'Use online city discovery at /api/discovery.' }, { status: 410, headers: { 'Cache-Control': 'no-store' } })
}
