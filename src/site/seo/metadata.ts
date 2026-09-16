import type { Metadata } from 'next'

const configured = new URL(process.env.SITE_URL || 'https://travel-buddy-cms-xi.vercel.app')
if (configured.protocol !== 'https:' || configured.username || configured.password || configured.pathname !== '/' || configured.search || configured.hash) {
    throw new Error('SITE_URL must be an HTTPS origin without a path, credentials, query or fragment')
}
export const siteUrl = configured.origin
export const preview = process.env.VERCEL_ENV === 'preview'
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString()
export function pageMetadata(path: string, title: string, description: string, noindex = false): Metadata {
    return {
        title, description,
        alternates: { canonical: path },
        robots: { index: !preview && !noindex, follow: true },
        openGraph: { type: 'website', siteName: 'TravelBuddy', title, description, url: path,
            images: [{ url: '/share-image', width: 1200, height: 630, alt: 'TravelBuddy — your local friend for exploring a new city' }] },
        twitter: { card: 'summary_large_image', title, description, images: ['/share-image'] },
    }
}
export function collectionMetadata(path: string, title: string, description: string, params: Record<string, unknown>): Metadata {
    const filtered = ['search','categoryId','free','open'].some(key => Boolean(params[key]))
    const page = typeof params.page === 'string' && /^[1-9]\d*$/.test(params.page) ? Number(params.page) : 1
    return pageMetadata(page > 1 ? `${path}?page=${page}` : path, page > 1 ? `${title} — Page ${page}` : title, description, filtered)
}
