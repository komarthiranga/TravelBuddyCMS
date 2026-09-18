import type { MetadataRoute } from 'next'
import { absoluteUrl, preview } from '@/site/seo/metadata'

export default function sitemap(): MetadataRoute.Sitemap {
    if (preview) return []
    return ['/', '/attractions', '/food', '/hotels', '/guide', '/transport', '/essentials', '/services', '/help', '/emergency', '/privacy', '/terms'].map(path => ({ url: absoluteUrl(path) }))
}
