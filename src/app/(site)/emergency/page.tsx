import { LifeBuoy } from 'lucide-react'

import { ComingSoonPage } from '@/site/components/ComingSoonPage'

export const metadata = {
    title: 'Emergency help — TravelBuddy',
    description: 'Urgent help in Eluru. Call 112 now if you need police, fire or ambulance.',
}

export default function EmergencyPage() {
    return (
        <ComingSoonPage
            title="Emergency help"
            summary="Hospital, police and pharmacy numbers will live here, verified and easy to tap. Until then, use the national number."
            icon={LifeBuoy}
            emergency
        />
    )
}
