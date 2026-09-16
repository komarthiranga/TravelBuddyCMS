import { pageMetadata } from '@/site/seo/metadata'
import { HelpContent } from '@/site/components/HelpContent'

export const metadata = pageMetadata('/emergency', 'Emergency Help | TravelBuddy', 'Find emergency contact information and practical help while travelling.')
export default function Page() { return <HelpContent emergency={true} /> }
