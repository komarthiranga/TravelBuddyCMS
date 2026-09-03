import { redirect } from 'next/navigation'

import { parseCityId } from '@/master/city/ids'

async function CityDetailPage({ params }: PageProps<'/city/[id]'>) {
    const { id } = await params
    const cityId = parseCityId(id)

    if (!cityId) {
        redirect('/city')
    }

    redirect(`/city/${cityId}/edit`)
}

export default CityDetailPage
