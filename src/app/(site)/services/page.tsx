import { getSelectedCity } from '@/site/lib/selected-city'
import { getLocalServices } from '@/site/services/data'
import { ServicesDirectory } from '@/site/components/ServicesDirectory'
import { pageMetadata } from '@/site/seo/metadata'
export const metadata=pageMetadata('/services','Local Services and Useful Contacts | TravelBuddy','Find hospitals, civic services, education and public-service contacts, with official directory sources and city or district coverage.')
export default async function Page() {
    const {city}=await getSelectedCity()
    const {services,loadedAt}=await getLocalServices(city?.id)
    return <ServicesDirectory cityName={city?.name ?? 'your city'} services={services} loadedAt={loadedAt} />
}
