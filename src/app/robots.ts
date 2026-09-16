import type { MetadataRoute } from 'next'
import { absoluteUrl, preview } from '@/site/seo/metadata'
export default function robots(): MetadataRoute.Robots {
    return {
        rules: preview ? { userAgent: '*', disallow: '/' } : {
            userAgent: '*', allow: '/',
            disallow: ['/api/', '/attraction$', '/attraction/', '/category$', '/category/', '/city$', '/city/', '/online'],
        },
        ...(!preview ? { sitemap: absoluteUrl('/sitemap.xml') } : {}),
    }
}
