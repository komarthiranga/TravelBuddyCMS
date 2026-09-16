import 'server-only'
import { headers } from 'next/headers'
import { validCmsCredentials } from './cms-credentials'

export async function requireCmsAdmin() {
    const requestHeaders = await headers()
    if (!validCmsCredentials(requestHeaders.get('authorization'), process.env)) {
        throw new Error('Administrator authentication required.')
    }
}
