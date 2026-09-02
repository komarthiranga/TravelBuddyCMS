import { getAPIKey } from '@/features/attractions/api/getAPIKey'

type coordinates = {
    lat: number,
    lon: number
}

export async function getLatLongForTheCity():Promise<coordinates> {

    const city = "Munnar, Kerala, India";

    const apiKey =  getAPIKey()

    if(!apiKey) {
        throw new Error('API key not found!')
    }
    const params = new URLSearchParams({
        text: city,
        type: "city",
        format: "json",
        limit: "1",
        apiKey
    })


    const response = await fetch(`https://api.geoapify.com/v1/geocode/search?${params}`);

    if(!response.ok) {
        throw new Error('Geoapify is failed')
    }

    const data = await response.json();

    const place = data.results?.[0];

    if(!place) {
        throw new Error('No Coordinates find for the city');
    }

    return {lat: place.lat, lon: place.lon}
  
}