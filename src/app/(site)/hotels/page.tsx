import { BedDouble } from 'lucide-react'

import { ComingSoonPage } from '@/site/components/ComingSoonPage'

export const metadata = {
    title: 'Hotels — TravelBuddy',
    description: 'Places to stay, coming soon.',
}

export default function HotelsPage() {
    return (
        <ComingSoonPage
            title="Hotels"
            summary="Only places I would let my own cousin sleep in. None listed yet."
            icon={BedDouble}
        />
    )
}
