import { notFound } from 'next/navigation'
import { OnlinePlacesPreview } from '@/site/components/OnlinePlacesPreview'
export const metadata = { title: 'Online places preview — Travel Buddy', robots: { index: false, follow: false } }
export default function OnlinePage() {
    if (process.env.NODE_ENV === 'production') notFound()
    return <OnlinePlacesPreview />
}
