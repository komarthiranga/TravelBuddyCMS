'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import {
    ArrowRight,
    Search,
    Shuffle,
    Leaf,
    Landmark,
    MapPin,
} from 'lucide-react'
import { useChrome } from './locale-provider'
import { BuddyMascot } from './BuddyMascot'
import { SavePlaceButton } from './SavedPlaces'
import type { JourneyPlace } from '@/site/api/getPlacesForJourney'

export type HeroPlace = Pick<
    JourneyPlace,
    | 'id'
    | 'short_name'
    | 'slug'
    | 'category_name'
    | 'short_description'
    | 'primary_image'
    | 'primary_image_alt'
>

export function HomeHero({
    cityName,
    places,
}: {
    cityName: string
    places: HeroPlace[]
}) {
    const router = useRouter()
    const { t, locale } = useChrome()
    const te = locale === 'te'
    const [mood, setMood] = useState('all')
    const [index, setIndex] = useState(0)
    const moods = [
        {
            id: 'all',
            en: 'All places',
            te: 'అన్నీ కొంచెం',
            icon: MapPin,
            test: /./,
        },
        {
            id: 'nature',
            en: 'Nature',
            te: 'ప్రకృతి మధ్య',
            icon: Leaf,
            test: /park|wildlife|nature|garden|lake|sanctuary/i,
        },
        {
            id: 'culture',
            en: 'Culture',
            te: 'సంస్కృతి పరిచయం',
            icon: Landmark,
            test: /religious|temple|heritage|museum|historic/i,
        },
    ].filter(
        (item) =>
            item.id === 'all' ||
            places.some((place) => item.test.test(place.category_name)),
    )
    const chosenMood = moods.find((item) => item.id === mood) ?? moods[0]
    const options = places.filter((place) =>
        chosenMood.test.test(place.category_name),
    )
    const place = options[index % options.length]
    function onSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const value = String(
            new FormData(event.currentTarget).get('q') ?? '',
        ).trim()
        router.push(
            value
                ? `/attractions?search=${encodeURIComponent(value)}`
                : '/attractions',
        )
    }
    return (
        <section lang={locale} className="border-b border-hairline bg-cream">
            <div className="mx-auto grid max-w-6xl items-start gap-6 px-5 py-6 sm:px-8 sm:py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-teal-brand-dark">
                        <span
                            aria-hidden="true"
                            className="size-2 rounded-full bg-teal-brand"
                        />
                        {te
                            ? 'కొత్త నగరం. స్నేహపూర్వక పరిచయం.'
                            : 'A new city. A familiar feeling.'}
                    </p>
                    <h1 className="mt-3 font-display text-3xl leading-[1.15] text-ink sm:text-5xl">
                        <span lang="en">{cityName}</span>
                        {te
                            ? 'ను మీ బడ్డీతో తెలుసుకోండి.'
                            : ', at your own pace.'}
                    </h1>
                    <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-soft">
                        {te
                            ? 'ఏం చూడాలో తెలియడం లేదా? మీకు నచ్చే ప్రదేశాన్ని కనుగొని, అక్కడికి వెళ్లే దారిని కలిసి చూద్దాం.'
                            : 'Find somewhere you’ll enjoy. I’ll help with the details and the way there.'}
                    </p>
                    <form
                        onSubmit={onSearch}
                        role="search"
                        className="mt-4 flex items-center gap-2 rounded-2xl border border-ink/20 bg-white p-2 pl-4 focus-within:ring-2 focus-within:ring-teal-brand"
                    >
                        <Search
                            className="size-5 shrink-0 text-ink-soft"
                            aria-hidden="true"
                        />
                        <label htmlFor="home-search" className="sr-only">
                            {t.searchPlaceholder}
                        </label>
                        <input
                            id="home-search"
                            name="q"
                            type="search"
                            placeholder={t.searchPlaceholder}
                            className="min-h-12 min-w-0 flex-1 bg-transparent text-base outline-none"
                        />
                        <button className="min-h-12 rounded-xl bg-ink px-4 font-semibold text-white focus-visible:outline-2 focus-visible:outline-teal-brand">
                            {te ? 'వెతకండి' : 'Search'}
                        </button>
                    </form>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                            href="/attractions"
                            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-brand px-5 font-semibold text-ink focus-visible:outline-2 focus-visible:outline-teal-brand"
                        >
                            {t.explorePlaces}
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                        <Link
                            href="#suggestion"
                            className="inline-flex min-h-12 items-center rounded-full border border-ink/20 px-5 font-semibold text-ink focus-visible:outline-2 focus-visible:outline-teal-brand"
                        >
                            {te ? 'ఎంచుకోవడంలో సహాయం' : 'Help me choose'}
                        </Link>
                    </div>
                    <Link
                        href="/attractions?free=1"
                        className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-teal-brand-dark underline underline-offset-4"
                    >
                        {te
                            ? 'బడ్జెట్ తక్కువా? ఉచిత ప్రదేశాలు చూడండి'
                            : 'Explore with free entry'}
                    </Link>
                </div>
                {place && (
                    <div id="suggestion" className="min-w-0 scroll-mt-4 lg:border-l lg:border-hairline lg:pl-8">
                        <div className="mb-4 flex items-center gap-3">
                            <BuddyMascot
                                pose="talk"
                                className="h-10 shrink-0"
                            />
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-widest text-teal-brand-dark">
                                    {te
                                        ? 'బడ్డీ నుండి ఒక ఆలోచన'
                                        : 'A little help from Buddy'}
                                </p>
                                <h2 className="mt-1 font-display text-2xl text-ink">
                                    {te
                                        ? 'ఈరోజు ఏం చేయాలనుంది?'
                                        : 'What would you enjoy?'}
                                </h2>
                            </div>
                        </div>
                        <div
                            role="group"
                            aria-label={te ? 'మీ ఆసక్తి' : 'Choose your mood'}
                            className="mb-4 flex flex-wrap gap-2"
                        >
                            {moods.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    aria-pressed={mood === item.id}
                                    onClick={() => {
                                        setMood(item.id)
                                        setIndex(0)
                                    }}
                                    className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand ${mood === item.id ? 'border-ink bg-ink text-white' : 'border-teal-brand/20 bg-white text-ink hover:border-teal-brand'}`}
                                >
                                    <item.icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {te ? item.te : item.en}
                                </button>
                            ))}
                        </div>
                        <article className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-sm">
                            <div className="relative aspect-[16/9] bg-cream sm:aspect-[2/1]">
                                {place.primary_image ? (
                                    <Image
                                        src={place.primary_image}
                                        alt={
                                            place.primary_image_alt ??
                                            place.short_name
                                        }
                                        fill
                                        sizes="(max-width: 1024px) 90vw, 480px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <MapPin
                                            className="size-12 text-teal-brand-dark"
                                            aria-hidden="true"
                                        />
                                    </div>
                                )}
                                <span
                                    lang="en"
                                    className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink"
                                >
                                    {place.category_name}
                                </span>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div aria-live="polite" aria-atomic="true">
                                    <p
                                        lang="en"
                                        className="font-display text-2xl text-ink"
                                    >
                                        {place.short_name}
                                    </p>
                                    <p
                                        lang="en"
                                        className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft"
                                    >
                                        {place.short_description}
                                    </p>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                                    <Link
                                        href={`/attractions/${encodeURIComponent(place.slug)}`}
                                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-brand px-4 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-teal-brand"
                                    >
                                        {te
                                            ? 'ఇక్కడి వివరాలు'
                                            : 'Explore this place'}
                                        <ArrowRight
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                    <SavePlaceButton
                                        compact
                                        place={{
                                            id: place.id,
                                            name: place.short_name,
                                            slug: place.slug,
                                            city: cityName,
                                        }}
                                    />
                                </div>
                            </div>
                        </article>
                        {options.length > 1 && (
                            <button
                                type="button"
                                onClick={() => setIndex((value) => value + 1)}
                                className="mx-auto mt-2 flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-teal-brand-dark focus-visible:outline-2 focus-visible:outline-teal-brand"
                            >
                                <Shuffle
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                {te
                                    ? 'మరో ఆలోచన చూపించు'
                                    : 'Show me another idea'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
