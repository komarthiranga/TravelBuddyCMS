import { DiscoveryPage } from '@/site/online/DiscoveryPage'
import { pageMetadata } from '@/site/seo/metadata'

export const metadata = pageMetadata('/', 'Explore India with TravelBuddy', 'Discover places online in cities across India. Save and like places for your next trip.')
export default function Page() { return <DiscoveryPage category="attractions" home={true} /> }
