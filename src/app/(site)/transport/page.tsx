import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Bus, Car, Footprints, MapPin } from 'lucide-react'
import { getSelectedCity } from '@/site/lib/selected-city'
import { LocalText } from '@/site/components/LocalText'

export const metadata = {
    title: 'Getting around — TravelBuddy',
    description: 'Plan a journey and check transport details before setting out.',
}

const options = [
    { title: 'Walking', te: 'నడక', icon: Footprints, text: 'Considering a short walk? Check the actual walking route, crossings, weather and your comfort before setting off.', textTe: 'దగ్గరలో నడిచి వెళ్లాలా? ముందుగా నడక మార్గం, రోడ్డు దాటే చోటులు, వాతావరణం, మీ సౌకర్యం చూసుకోండి.' },
    { title: 'Auto-rickshaw', te: 'ఆటో', icon: MapPin, text: 'Show the driver your destination and confirm the total fare before starting. Check whether the ride is shared or private and where you will be dropped off.', textTe: 'డ్రైవర్‌కు గమ్యం చూపించి మొత్తం ఛార్జీ తెలుసుకోండి. షేరింగ్ ఆటోనా, ప్రత్యేక ప్రయాణమా, ఎక్కడ దించుతారో నిర్ధారించుకోండి.' },
    { title: 'Bus', te: 'బస్సు', icon: Bus, text: 'Confirm the boarding stop, departure and last return service with the operator. Travel Buddy does not yet have verified local bus timetables or fares.', textTe: 'ఎక్కే స్టాప్, బయలుదేరే సమయం, చివరి తిరుగు బస్సును నిర్వాహకులతో నిర్ధారించుకోండి. స్థానిక బస్సు సమయాలు, ఛార్జీలు ఇంకా నిర్ధారించలేదు.' },
    { title: 'Car or taxi', te: 'కారు లేదా టాక్సీ', icon: Car, text: 'Confirm availability, the total price and any waiting or parking charges with the provider. Ask about the drop-off point and arrange your return journey.', textTe: 'వాహనం అందుబాటు, మొత్తం ధర, వేచి ఉండే లేదా పార్కింగ్ ఛార్జీలు తెలుసుకోండి. దిగే ప్రదేశం, తిరుగు ప్రయాణం ముందే నిర్ధారించుకోండి.' },
]

export default async function TransportPage() {
    const { city } = await getSelectedCity()
    const ap = city?.state.trim().toLowerCase() === 'andhra pradesh'
    const india = city?.country.trim().toLowerCase() === 'india'
    return <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
        <header className="max-w-3xl">
            <p className="text-sm font-semibold text-teal-brand-dark">{city ? `${city.name}, ${city.state}` : 'Travel Buddy'}</p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-5xl"><LocalText en="Let’s work out how to get there" te="అక్కడికి ఎలా వెళ్లాలో చూద్దాం" /></h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft"><LocalText en="Start with one place. I’ll help you choose a starting point and explore a route, with the details to check before you go." te="ముందుగా ఒక ప్రదేశాన్ని ఎంచుకోండి. ప్రారంభ స్థానం, మార్గం, వెళ్లే ముందు తెలుసుకోవాల్సిన వివరాలతో సహాయం చేస్తాను." /></p>
        </header>
        <section aria-labelledby="transport-start" className="mt-6 rounded-2xl bg-teal-wash p-5 sm:p-7">
            <h2 id="transport-start" className="text-xl font-semibold text-ink"><LocalText en="Where would you like to go?" te="మీరు ఎక్కడికి వెళ్లాలనుకుంటున్నారు?" /></h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft"><LocalText en="Choose a place in the guide, then use your location or the city centre as a starting point. The city centre is a reference point, not your current location." te="గైడ్‌లో ప్రదేశాన్ని ఎంచుకుని మీ స్థానం లేదా నగర కేంద్రం నుండి ప్రారంభించండి. నగర కేంద్రం సూచన కోసం మాత్రమే; అది మీ ప్రస్తుత స్థానం కాదు." /></p>
            <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/guide" className="buddy-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand"><LocalText en="Plan my journey" te="నా ప్రయాణాన్ని ప్లాన్ చేయండి" /><ArrowRight className="size-4" aria-hidden="true" /></Link>
                <Link href="/attractions" className="inline-flex min-h-12 items-center rounded-xl border border-teal-brand/30 px-5 font-semibold text-teal-brand-dark focus-visible:outline-2 focus-visible:outline-teal-brand"><LocalText en="Help me choose a place" te="ప్రదేశాన్ని ఎంచుకోవడంలో సహాయం" /></Link>
            </div>
        </section>
        <section aria-labelledby="transport-options" className="mt-8">
            <h2 id="transport-options" className="text-2xl font-semibold text-ink"><LocalText en="Choose what works for your trip" te="మీ ప్రయాణానికి సరిపోయేది ఎంచుకోండి" /></h2>
            <p className="mt-2 text-sm text-ink-soft"><LocalText en="General planning tips. Local availability, prices and accessibility need confirmation." te="ఇవి సాధారణ ప్రయాణ సూచనలు. స్థానిక అందుబాటు, ధరలు, సులభ ప్రవేశ సదుపాయాలను నిర్ధారించుకోవాలి." /></p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">{options.map(option => <article key={option.title} className="rounded-2xl border border-hairline bg-white p-5">
                <h3 className="flex items-center gap-3 text-lg font-semibold text-ink"><option.icon className="size-5 shrink-0 text-teal-brand-dark" aria-hidden="true" /><LocalText en={option.title} te={option.te} /></h3>
                <p className="mt-3 leading-relaxed text-ink-soft"><LocalText en={option.text} te={option.textTe} /></p>
            </article>)}</div>
        </section>
        {(ap || india) && <section aria-labelledby="onward-travel" className="mt-8 rounded-2xl border border-hairline bg-white p-5">
            <h2 id="onward-travel" className="text-xl font-semibold text-ink"><LocalText en="Travelling beyond the city?" te="నగరం బయటకు ప్రయాణిస్తున్నారా?" /></h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft"><LocalText en="Check services and booking details on the operator’s website. These links are not a verified local bus timetable." te="సర్వీసులు, బుకింగ్ వివరాలను నిర్వాహకుల వెబ్‌సైట్‌లో చూడండి. ఈ లింకులు నిర్ధారించిన స్థానిక బస్సు సమయాల పట్టిక కాదు." /></p>
            <div className="mt-3 flex flex-wrap gap-4">{[
                ...(ap ? [{href:'https://www.apsrtconline.in/oprs-web',label:'APSRTC bus reservations'}] : []),
                ...(india ? [{href:'https://www.irctc.co.in/',label:'IRCTC train reservations'}] : []),
            ].map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded text-sm font-semibold text-teal-brand-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand">{link.label}<ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only"><LocalText en=" (opens a new tab)" te=" (కొత్త ట్యాబ్‌లో తెరుచుకుంటుంది)" /></span></a>)}</div>
        </section>}
        <section className="mt-8 max-w-3xl">
            <h2 className="text-xl font-semibold text-ink"><LocalText en="A little planning for the way back" te="తిరుగు ప్రయాణానికి చిన్న ప్రణాళిక" /></h2>
            <p className="mt-2 leading-relaxed text-ink-soft"><LocalText en="Save your destination and check return options. If you need step-free access, seating or assistance, confirm it with the venue and transport provider. Route times are estimates, not promises." te="గమ్యాన్ని సేవ్ చేసుకుని తిరుగు ప్రయాణ అవకాశాలు చూడండి. మెట్లు లేని ప్రవేశం, సీటు లేదా సహాయం అవసరమైతే ముందే నిర్ధారించుకోండి. ప్రయాణ సమయాలు అంచనాలు మాత్రమే." /></p>
            <Link href="/emergency" className="mt-3 inline-flex min-h-11 items-center rounded font-semibold text-teal-brand-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand"><LocalText en="Need urgent help?" te="అత్యవసర సహాయం కావాలా?" /></Link>
        </section>
    </div>
}
