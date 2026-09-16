import { pageMetadata } from '@/site/seo/metadata'
import { HelpContent } from '@/site/components/HelpContent'

export const metadata = pageMetadata('/help', 'Help Using TravelBuddy', 'Find help choosing a city, exploring places and planning your journey.')
export default function Page() { return <HelpContent emergency={false} /> }
