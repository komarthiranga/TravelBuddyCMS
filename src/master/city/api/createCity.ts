import { db } from '@/lib/db'
import { cityTable } from '@/master/city/schema'

export async function createCity(city: {
    name: string
    code: string
    state: string
    country: string
    latitude: string | null
    longitude: string | null
    is_active: boolean
}) {
    return db.insert(cityTable).values(city)
}
