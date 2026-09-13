import { cache } from 'react'
import { cookies } from 'next/headers'
import { getCitiesWithAttractionCount } from '@/site/api/getCitiesWithAttractionCount'

export const getSelectedCity = cache(async () => {
    const [cities, jar] = await Promise.all([
        getCitiesWithAttractionCount(),
        cookies(),
    ])
    const selected = jar.get('tb-city')?.value
    return {
        cities,
        city:
            cities.find((city) => String(city.id) === selected) ??
            cities[0] ??
            null,
    }
})
