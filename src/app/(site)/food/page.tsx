import { Utensils } from 'lucide-react'

import { ComingSoonPage } from '@/site/components/ComingSoonPage'

export const metadata = {
    title: 'Food — TravelBuddy',
    description: 'Local places to eat, coming soon.',
}

export default function FoodPage() {
    return (
        <ComingSoonPage
            title="Food"
            summary="Local tiffin and street food, not tourist traps. I am still writing these down."
            icon={Utensils}
        />
    )
}
