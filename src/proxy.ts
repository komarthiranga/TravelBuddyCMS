import { NextResponse, type NextRequest } from 'next/server'
import { cmsConfigured, validCmsCredentials } from './lib/cms-credentials'

export function proxy(request: NextRequest) {
    const responseHeaders = {
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow',
        'Vary': 'Authorization',
    }
    if (!cmsConfigured(process.env)) {
        return new NextResponse('CMS access is disabled until administrator credentials are configured.', {
            status: 503, headers: responseHeaders,
        })
    }
    if (!validCmsCredentials(request.headers.get('authorization'), process.env)) {
        return new NextResponse('Administrator sign-in required.', {
            status: 401,
            headers: { ...responseHeaders, 'WWW-Authenticate': 'Basic realm="Travel Buddy CMS", charset="UTF-8"' },
        })
    }
    const response = NextResponse.next()
    for (const [key, value] of Object.entries(responseHeaders)) response.headers.set(key, value)
    return response
}

export const config = {
    matcher: ['/attraction/:path*', '/category/:path*', '/city/:path*'],
}
