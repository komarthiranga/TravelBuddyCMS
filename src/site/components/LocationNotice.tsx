'use client'

import { LoaderCircle, MapPin, Navigation } from 'lucide-react'
import { useLocation } from './location-provider'
import { useChrome } from './locale-provider'

export function LocationNotice({
    tone = 'day',
    className = '',
}: {
    tone?: 'day' | 'night'
    className?: string
}) {
    const { startPoint, cityCentre, status, request, chooseCentre, clear } =
        useLocation()
    const { locale } = useChrome()
    const te = locale === 'te'
    const locating = status === 'locating'
    const user = startPoint?.kind === 'user'
    const centre = startPoint?.kind === 'centre'
    const city = cityCentre?.name ?? ''
    const message = locating
        ? te
            ? 'మీ స్థానాన్ని కనుగొంటున్నాను…'
            : 'Finding your location…'
        : status === 'denied'
          ? te
              ? 'స్థాన అనుమతి లేదు. నగర కేంద్రాన్ని ఎంచుకోవచ్చు.'
              : 'Location permission is off. You can use the city centre instead.'
          : status === 'error' || status === 'unavailable'
            ? te
                ? 'స్థానం కనుగొనలేకపోయాను. మళ్లీ ప్రయత్నించండి లేదా నగర కేంద్రాన్ని ఎంచుకోండి.'
                : 'I couldn’t find your location. Try again or use the city centre.'
            : user
              ? te
                  ? 'మీరు సేవ్ చేసిన స్థానం నుండి దూరాలు చూపిస్తున్నాను.'
                  : 'Distances use your saved location. Moved since your last visit? Refresh it.'
              : centre
                ? te
                    ? `${city} నగర కేంద్రం నుండి దూరాలు చూపిస్తున్నాను.`
                    : `Distances use ${city} city centre.`
                : te
                  ? 'ఎక్కడి నుండి బయలుదేరుతారు?'
                  : 'Where would you like to start?'
    return (
        <div
            lang={locale}
            className={`rounded-2xl border p-4 ${tone === 'night' ? 'border-white/20 bg-ink text-white' : 'border-hairline bg-white text-ink'} ${className}`}
        >
            <p role="status" className="text-base leading-relaxed">
                {message}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={request}
                    disabled={locating || status === 'unavailable'}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white ring-1 ring-white/30 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-teal-brand"
                >
                    {locating ? (
                        <LoaderCircle
                            className="size-4 animate-spin"
                            aria-hidden="true"
                        />
                    ) : (
                        <Navigation className="size-4" aria-hidden="true" />
                    )}
                    {user
                        ? te
                            ? 'స్థానం నవీకరించండి'
                            : 'Refresh location'
                        : te
                          ? 'నా స్థానం ఉపయోగించండి'
                          : 'Use my location'}
                </button>
                {cityCentre && !centre && (
                    <button
                        type="button"
                        onClick={chooseCentre}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-current px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-teal-brand"
                    >
                        <MapPin className="size-4" aria-hidden="true" />
                        {te ? 'నగర కేంద్రం నుండి' : 'Use city centre'}
                    </button>
                )}
                {startPoint && (
                    <button
                        type="button"
                        onClick={clear}
                        className="min-h-11 rounded-full px-3 text-sm font-semibold underline focus-visible:outline-2 focus-visible:outline-teal-brand"
                    >
                        {te ? 'స్థానం తొలగించండి' : 'Clear location'}
                    </button>
                )}
            </div>
            {!startPoint && (
                <p className="mt-2 text-sm opacity-80">
                    {te
                        ? 'స్థానం ఇవ్వకుండానే ప్రదేశాలను చూడవచ్చు.'
                        : 'You can browse places without sharing your location.'}
                </p>
            )}
        </div>
    )
}
