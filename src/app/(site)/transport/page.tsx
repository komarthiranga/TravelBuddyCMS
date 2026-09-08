import { Bus } from 'lucide-react'

import { ComingSoonPage } from '@/site/components/ComingSoonPage'

export const metadata = {
    title: 'Getting around — TravelBuddy',
    description: 'Local transport help, coming soon.',
}

export default function TransportPage() {
    return (
        <ComingSoonPage
            title="Getting around"
            summary="Autos, buses and how locals actually move around town. I want this exactly right before I promise it."
            icon={Bus}
        />
    )
}
