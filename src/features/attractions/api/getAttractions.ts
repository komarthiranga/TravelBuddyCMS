import { getLatLongForTheCity } from '@/features/attractions/api/getCityCoordinates'
import { getAPIKey } from '@/features/attractions/api/getAPIKey'

export async function getAttractions() {

    const apiKey = getAPIKey();

    if (!apiKey) {
        throw new Error('API not found!')
    }

    const { lat, lon } = await getLatLongForTheCity()

    if (!lat || !lon) {
        throw new Error('Lat and Long not fiund for the city!')
    }

    const placesParams = new URLSearchParams({
        categories: "tourism.attraction,tourism.sights",
        filter: `circle:${lon},${lat},25000`,
        bias: `proximity:${lon},${lat}`,
        limit: "20",
        lang: "en",
        apiKey,
    });

    const placesUrl =
        `https://api.geoapify.com/v2/places?${placesParams}`;

    const placesResponse = await fetch(placesUrl);

    if (!placesResponse.ok) {
        throw new Error('There is problem while fetching the places')
    }

    const placesData = await placesResponse.json();

    return placesData;


}