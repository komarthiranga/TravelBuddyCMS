import Link from 'next/link'
import { ShoppingBasket, Pill, Landmark, Shirt, Droplets, Smartphone, ArrowUpRight, BookOpen } from 'lucide-react'
import { getSelectedCity } from '@/site/lib/selected-city'
import { LocalText } from '@/site/components/LocalText'
import { pageMetadata } from '@/site/seo/metadata'

export const metadata = pageMetadata('/essentials', 'Everyday Essentials | TravelBuddy', 'Find everyday needs in your selected city, from groceries and pharmacies to ATMs and laundry.')
const needs = [
    { name: 'Groceries', te: 'కిరాణా', hint: 'Pick up a few everyday basics.', hintTe: 'రోజువారీ సరుకులు కొనండి.', query: 'grocery stores', icon: ShoppingBasket },
    { name: 'Pharmacies', te: 'మెడికల్ షాపులు', hint: 'Find a pharmacy and check its opening hours.', hintTe: 'మెడికల్ షాపు, పని వేళలు తెలుసుకోండి.', query: 'pharmacies', icon: Pill },
    { name: 'ATMs & banks', te: 'ఏటీఎంలు & బ్యాంకులు', hint: 'Find a cash machine or a bank branch.', hintTe: 'ఏటీఎం లేదా బ్యాంకు శాఖను కనుగొనండి.', query: 'ATMs and banks', icon: Landmark },
    { name: 'Laundry', te: 'లాండ్రీ', hint: 'Ask about pricing and collection times.', hintTe: 'ధరలు, బట్టలు తీసుకునే సమయం అడగండి.', query: 'laundry services', icon: Shirt },
    { name: 'Drinking water', te: 'తాగునీరు', hint: 'Find packaged drinking-water suppliers.', hintTe: 'ప్యాకేజ్డ్ తాగునీటి సరఫరాదారులను కనుగొనండి.', query: 'packaged drinking water suppliers', icon: Droplets },
    { name: 'Mobile stores', te: 'మొబైల్ దుకాణాలు', hint: 'Find stores for recharges and phone essentials.', hintTe: 'రీచార్జ్, ఫోన్ అవసరాల దుకాణాలు.', query: 'mobile phone stores', icon: Smartphone },
]
export default async function EssentialsPage() {
    const { city } = await getSelectedCity()
    const place = city ? `${city.name}, ${city.state}, ${city.country}` : null
    return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <header className="rounded-3xl bg-[#edf0e4] p-7 sm:p-10"><p className="text-xs font-semibold uppercase tracking-widest text-teal-brand-dark">{city?.name ?? 'TravelBuddy'}</p><h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl"><LocalText en="Little things. A smoother day." te="చిన్న అవసరాలు. సులభమైన రోజు." /></h1><p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft"><LocalText en="Water, groceries, a quick recharge—let’s take care of the everyday things so you can feel more at home." te="నీరు, కిరాణా, రీచార్జ్—రోజువారీ అవసరాలను చూసుకుందాం." /></p></header>
        <section aria-labelledby="essentials-heading" className="mt-9"><h2 id="essentials-heading" className="font-display text-2xl"><LocalText en="What do you need to pick up?" te="మీకు ఏమి కావాలి?" /></h2><p className="mt-3 max-w-3xl text-sm leading-6 text-ink-soft"><LocalText en="We’re building our local listings. These links search Google Maps in your selected city; results, prices and opening hours are provided by Maps and the businesses." te="స్థానిక జాబితాలు సిద్ధం చేస్తున్నాం. ఈ లింకులు ఎంచుకున్న నగరంలో Google Mapsలో వెతుకుతాయి. వివరాలు, ధరలు, పని వేళలను వ్యాపారులతో నిర్ధారించుకోండి." /></p>
            {!place && <p className="mt-4 rounded-xl bg-amber-50 p-4"><LocalText en="Choose a city in the header to search for essentials." te="అవసరాల కోసం పైన నగరాన్ని ఎంచుకోండి." /></p>}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{needs.map(({ name, te, hint, hintTe, query, icon: Icon }) => <article key={name} className="flex flex-col rounded-2xl border border-hairline bg-white p-6"><Icon className="mb-5 text-teal-brand-dark" size={27} strokeWidth={1.5} aria-hidden="true" /><h3 className="text-lg font-semibold"><LocalText en={name} te={te} /></h3><p className="mb-5 mt-2 text-sm leading-6 text-ink-soft"><LocalText en={hint} te={hintTe} /></p>{place && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} in ${place}`)}`} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-teal-brand-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand"><LocalText en={`Find ${name === 'ATMs & banks' ? name : name.toLowerCase()} in Maps`} te="Mapsలో వెతకండి" /><ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"><LocalText en="(opens a new tab)" te="(కొత్త ట్యాబ్)" /></span></a>}</article>)}</div>
        </section>
        <aside className="mt-8 flex flex-wrap items-center gap-5 rounded-2xl border border-hairline p-6"><BookOpen size={27} className="text-teal-brand-dark" aria-hidden="true" /><div className="min-w-0 flex-1"><h2 className="text-lg font-semibold"><LocalText en="Need a local service or useful contact?" te="స్థానిక సేవ లేదా సంప్రదింపు కావాలా?" /></h2><p className="mt-2 text-sm leading-6 text-ink-soft"><LocalText en="Browse hospitals, public services, schools and other source-linked contacts." te="ఆసుపత్రులు, ప్రజా సేవలు, పాఠశాలలు, ఇతర సంప్రదింపులు చూడండి." /></p></div><Link href="/services" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#204b3c] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand"><LocalText en="Browse local services" te="స్థానిక సేవలు చూడండి" /><ArrowUpRight size={17} /></Link></aside>
    </div>
}
