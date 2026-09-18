export const metadata = { title: 'Privacy | TravelBuddy' }
export default function Page() {
    return <article className="mx-auto max-w-3xl space-y-5 px-5 py-10 leading-7"><h1 className="font-display text-4xl">Privacy</h1>
        <p>You can browse TravelBuddy without an account. Google sign-in supplies your account identifier, name and email so we can keep your saved and liked places associated with you.</p>
        <p>We store your profile and the Google place identifiers you save or like in our database. Place descriptions, photos, ratings and opening hours are retrieved from Google when needed, rather than copied into our master tables. Unsave and unlike a place to remove it from your collection.</p>
        <p>Your selected city’s place identifier is stored in your browser so you can resume browsing. Your sign-in session uses secure cookies in production. If you allow location access, we use your device’s coordinates to find nearby places and automatically use your current location on future visits while permission remains granted. You can select a different city at any time.</p>
        <p>Coordinates are sent to our server and Google Maps Platform for nearby search. We keep them only in the current page’s memory; we do not save them in your profile, database or browser storage. Turn off location access in your browser settings to revoke permission.</p>
        <p>City searches, selected destination identifiers and place requests are sent to Google Maps Platform through our server. Loading a photo or following a Google Maps or external website link connects your browser to that service. Its own privacy policy then applies.</p>
        <p>Google services are governed by the <a href="https://policies.google.com/privacy" className="underline">Google Privacy Policy</a>. Our use of information received from Google sign-in follows the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="underline">Google API Services User Data Policy</a>, including its Limited Use requirements.</p>
        <p>To remove all stored account data, sign in and use the account deletion option on your Saved & liked page.</p>
    </article>
}
