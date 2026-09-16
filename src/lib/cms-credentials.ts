import { createHash, timingSafeEqual } from 'node:crypto'

type Credentials = { [key: string]: string | undefined; CMS_ADMIN_USERNAME?: string; CMS_ADMIN_PASSWORD?: string }

export function cmsConfigured(env: Credentials): boolean {
    return Boolean(env.CMS_ADMIN_USERNAME && /^[A-Za-z0-9._@-]{1,100}$/.test(env.CMS_ADMIN_USERNAME)
        && env.CMS_ADMIN_PASSWORD && /^[\x21-\x7e]{32,256}$/.test(env.CMS_ADMIN_PASSWORD))
}

/** No default credentials and no trust in client-supplied role headers. */
export function validCmsCredentials(authorization: string | null, env: Credentials): boolean {
    if (!cmsConfigured(env) || !authorization || authorization.length > 1024) return false
    const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(authorization)
    if (!match) return false
    const supplied = Buffer.from(match[1], 'base64')
    const expected = Buffer.from(`${env.CMS_ADMIN_USERNAME}:${env.CMS_ADMIN_PASSWORD}`, 'utf8')
    // Fixed-size digests avoid length-dependent comparison and exceptions.
    return timingSafeEqual(createHash('sha256').update(supplied).digest(), createHash('sha256').update(expected).digest())
}
