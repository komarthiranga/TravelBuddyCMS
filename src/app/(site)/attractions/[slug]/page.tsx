import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, MapPin } from 'lucide-react'
import { PlaceImage } from '@/site/components/PlaceImage'
import { isCategoryIllustration } from '@/site/lib/category-artwork'
import { getNearbyAttractions } from '@/site/api/getNearbyAttractions'
import { getPublishedAttractionBySlug } from '@/site/api/getPublishedAttractionBySlug'
import { priceLabel, pricingKind } from '@/site/verification/model'
import { VerificationBadge } from '@/site/components/VerificationBadge'
import { LocalText, TranslationNotice } from '@/site/components/LocalText'
import { DistanceBadge } from '@/site/components/DistanceBadge'
import { SavePlaceButton } from '@/site/components/SavedPlaces'
import { LocationNotice } from '@/site/components/LocationNotice'
import { TakeMeThere } from '@/site/components/TakeMeThere'
import { formatDistance, toCoords } from '@/site/lib/geo'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const data = await getPublishedAttractionBySlug(slug)
    if (!data) return { title: 'Not found — TravelBuddy' }

    const { attraction, images } = data
    return {
        title: `${attraction.short_name}, ${attraction.city_name} — TravelBuddy`,
        description: attraction.short_description,
        alternates: { canonical: `/attractions/${attraction.slug}` },
        openGraph: {
            type: 'article',
            title: attraction.short_name,
            description: attraction.short_description,
            images: images[0] ? [images[0].image_url] : undefined,
        },
    }
}

function formatTime(value: string | null) {
    if (!value) return null
    const [h, m] = value.split(':').map(Number)
    if (!Number.isInteger(h) || h < 0 || h > 23 || !Number.isInteger(m) || m < 0 || m > 59) return null
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default async function AttractionDetailPage({params}: {params: Promise<{slug: string}>}) {
    const {slug} = await params
    const data = await getPublishedAttractionBySlug(slug)
    if (!data) notFound()
    const {attraction, images} = data
    const origin = toCoords(attraction.latitude, attraction.longitude)
    const nearby = await getNearbyAttractions(attraction.id, attraction.city_id, origin, 3)
    const imported = /Imported map data, not a verified local recommendation/.test(attraction.full_description ?? '')
    const fee = priceLabel(attraction)
    const checkedAdmission = pricingKind(attraction.category_name) === 'admission' && attraction.verification.checks.some(check => check.field === 'admission')
    const checkedHours = attraction.verification.checks.some(check => check.field === 'hours')
    const opening = formatTime(attraction.opening_time), closing = formatTime(attraction.closing_time)
    const hours = checkedHours && opening && closing ? `${opening} – ${closing}` : 'Check with the venue'
    const realPhotos = images.filter(image => !isCategoryIllustration(image.image_url, image.alt_text))
    const displayImages = realPhotos.length ? realPhotos : images.slice(0, 1)
    const hero = displayImages[0]
    const gallery = displayImages.slice(1)
    const commonsPhoto = displayImages.some(image => image.image_url.includes('/travel-buddy/commons/58884991-'))
    const sourceUrl = attraction.full_description?.match(/https:\/\/www\.openstreetmap\.org\/(?:way|node|relation)\/\d+/)?.[0]
    const paragraphs = (imported ? attraction.short_description : attraction.full_description ?? attraction.short_description).split(/\n{2,}/).filter(Boolean)
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(origin ? `${origin.lat},${origin.lng}` : `${attraction.full_name}, ${attraction.address}`)}`
    const jsonLd = {'@context':'https://schema.org','@type':'Place',name:attraction.full_name,description:attraction.short_description,
        ...(realPhotos.length ? {image:realPhotos.map(image=>image.image_url)} : {}),
        ...(checkedAdmission && Number.isFinite(Number.parseFloat(attraction.entry_fee)) ? {isAccessibleForFree:Number.parseFloat(attraction.entry_fee)===0} : {}),
        ...(origin ? {geo:{'@type':'GeoCoordinates',latitude:origin.lat,longitude:origin.lng}} : {})}
    return <article className="bg-cream pb-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}} />
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8 sm:py-8">
            <Link href="/attractions" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-teal-brand-dark focus-visible:outline-2 focus-visible:outline-teal-brand"><ArrowLeft className="size-4" aria-hidden="true" /><LocalText en="All places" te="అన్ని ప్రదేశాలు" /></Link>
            <header className="mb-6 mt-3 flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-sm font-semibold text-teal-brand-dark">{attraction.category_name} · {attraction.city_name}</p><h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-5xl">{attraction.short_name}</h1><p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><MapPin className="size-4" aria-hidden="true" />{attraction.address}</p></div>
                <SavePlaceButton place={{id:attraction.id,name:attraction.short_name,slug:attraction.slug,city:attraction.city_name}} />
            </header>
            {attraction.verification.checks.length > 0 && <div className="mb-4"><VerificationBadge verification={attraction.verification} compact /></div>}
            <TranslationNotice />
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
                <div className="min-w-0">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-teal-wash"><PlaceImage src={hero?.image_url} alt={hero?.alt_text} name={attraction.short_name} category={attraction.category_name} eager sizes="(max-width:1024px) 100vw, 680px" /></div>
                    {commonsPhoto && <details className="mt-2 text-xs text-ink-soft"><summary className="inline-flex min-h-11 cursor-pointer items-center rounded underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand">Photo taken in 2017 · Credits</summary><p className="pb-3 leading-relaxed"><a className="underline" href="https://commons.wikimedia.org/wiki/File:Pedestrian_Bridge_in_Brudhavan_Gardens.jpg">Pedestrian Bridge in Brudhavan Gardens</a> by IM3847, 14 May 2017. <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Resized and cropped for display. The park may look different today.</p></details>}
                </div>
                <aside aria-label="Plan your visit" className="rounded-2xl border border-hairline bg-white p-5 sm:p-6">
                    <h2 className="text-xl font-semibold text-ink"><LocalText en="Plan your visit" te="సందర్శనను ప్లాన్ చేయండి" /></h2>

                    <dl className="mt-4 divide-y divide-hairline text-sm">
                        <div className="flex justify-between gap-4 py-4"><dt className="text-ink-soft"><LocalText en="Opening hours" te="ప్రారంభ సమయాలు" /></dt><dd className="text-right font-semibold text-ink"><LocalText en={hours} te={checkedHours ? hours : 'నిర్వాహకులతో తెలుసుకోండి'} /></dd></div>
                        <div className="flex justify-between gap-4 py-4"><dt className="text-ink-soft"><LocalText en={pricingKind(attraction.category_name) === 'admission' ? 'Entry fee' : 'Pricing'} te="ధరలు" /></dt><dd className="text-right font-semibold text-ink"><LocalText en={fee.en === 'Entry fee not confirmed' ? 'Check with the venue' : fee.en} te={fee.en === 'Entry fee not confirmed' ? 'నిర్వాహకులతో తెలుసుకోండి' : fee.te} /></dd></div>
                        {attraction.best_time_to_visit && <div className="py-4"><dt className="text-ink-soft">Best time to visit</dt><dd className="mt-1 text-ink">{attraction.best_time_to_visit}</dd></div>}
                    </dl>
                    {!attraction.verification.checks.some(check => check.field === 'coordinates') && <p className="mt-2 text-xs leading-relaxed text-ink-soft"><LocalText en="Exact entrance pin not checked yet. Review the location in Maps before travelling." te="ఖచ్చితమైన ప్రవేశ స్థానం ఇంకా తనిఖీ చేయలేదు. ప్రయాణానికి ముందు మ్యాప్‌లో చూడండి." /></p>}
                    <VerificationBadge verification={attraction.verification} />
                    <TakeMeThere destination={origin} destinationName={attraction.short_name} className="buddy-primary mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 font-semibold disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-teal-brand" />
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded text-sm font-semibold text-teal-brand-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand"><LocalText en="View location in Google Maps" te="Google Mapsలో చూడండి" /><ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only"> (opens a new tab)</span></a>
                    <details className="mt-3 border-t border-hairline pt-2"><summary className="min-h-11 cursor-pointer rounded py-3 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-teal-brand"><LocalText en="How far is it from me?" te="నా నుండి ఎంత దూరం?" /></summary><LocationNotice className="mb-3" /><DistanceBadge latitude={attraction.latitude} longitude={attraction.longitude} /></details>
                </aside>
            </div>
            <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
                <section><h2 className="text-2xl font-semibold text-ink"><LocalText en="About this place" te="ప్రదేశం గురించి" /></h2><div className="mt-3 space-y-3 text-base leading-relaxed text-ink-soft">{paragraphs.map((text,index)=><p key={index}>{text}</p>)}</div>
                    {!imported && attraction.instructions && <div className="mt-6 rounded-xl bg-teal-wash p-4"><h3 className="font-semibold text-ink">Before you go</h3><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{attraction.instructions}</p></div>}
                    {sourceUrl && <details className="mt-4 border-t border-hairline text-sm text-ink-soft"><summary className="min-h-11 cursor-pointer rounded py-3 font-semibold focus-visible:outline-2 focus-visible:outline-teal-brand">Listing source</summary><p className="pb-3">Map data: <a className="underline" href={sourceUrl}>OpenStreetMap contributors</a>, <a className="underline" href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL 1.0</a>.</p></details>}
                </section>
                {nearby.length>0 && <section><h2 className="text-xl font-semibold text-ink"><LocalText en="Explore nearby" te="దగ్గరలోని ప్రదేశాలు" /></h2><ul className="mt-4 space-y-3">{nearby.map(place=><li key={place.id}><Link href={`/attractions/${place.slug}`} className="flex gap-3 rounded-xl border border-hairline bg-white p-3 hover:border-teal-brand focus-visible:outline-2 focus-visible:outline-teal-brand"><span className="relative size-16 shrink-0 overflow-hidden rounded-lg"><PlaceImage src={place.primary_image} alt={place.primary_image_alt} name={place.short_name} category={place.category_name} sizes="64px" compact /></span><span className="min-w-0"><span className="block text-xs text-teal-brand-dark">{place.category_name}</span><span className="mt-1 block text-sm font-semibold text-ink">{place.short_name}</span>{place.km!==null && <span className="mt-1 block text-xs text-ink-soft">{formatDistance(place.km)} · straight-line from here</span>}</span></Link></li>)}</ul></section>}
            </div>
            {gallery.length>0 && <section className="mt-8"><h2 className="text-2xl font-semibold text-ink">More photos</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{gallery.map(image=><div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl"><PlaceImage src={image.image_url} alt={image.alt_text} name={attraction.short_name} category={attraction.category_name} sizes="(max-width:640px) 100vw, 50vw" /></div>)}</div></section>}
        </div>
    </article>
}
