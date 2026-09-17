import type { MetadataRoute } from 'next'
import { sql } from '@/lib/db'
import { absoluteUrl, preview } from '@/site/seo/metadata'

// Query at request time: never publish draft/inactive records or make builds depend on Neon.
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    if (preview) return []
    const places = await sql<{slug:string;updated_at:Date}[]>`
        select a.slug, a.updated_at from attraction a join city c on c.id=a.city_id
        where a.status='PUBLISHED' and a.is_active=true and c.is_active=true order by a.id`
    return [
        ...['/','/attractions','/food','/hotels','/guide','/transport','/essentials','/services','/help','/emergency'].map(path => ({url:absoluteUrl(path)})),
        ...places.map(place => ({url:absoluteUrl(`/attractions/${encodeURIComponent(place.slug)}`),lastModified:place.updated_at})),
    ]
}
