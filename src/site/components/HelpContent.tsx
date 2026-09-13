'use client'

import Link from 'next/link'
import { Phone } from 'lucide-react'
import { useChrome } from './locale-provider'

export function HelpContent({ emergency = false }: { emergency?: boolean }) {
    const { locale } = useChrome()
    const te = locale === 'te'
    return (
        <div
            lang={locale}
            className="mx-auto max-w-3xl px-5 py-6 sm:px-8 sm:py-10"
        >
            <h1 className="font-display text-3xl text-ink">
                {emergency
                    ? te
                        ? 'అత్యవసర సహాయం'
                        : 'Emergency help'
                    : te
                      ? 'మీకు ఎలా సహాయం చేయగలను?'
                      : 'How can I help?'}
            </h1>
            <section
                aria-labelledby="emergency-heading"
                className="mt-5 rounded-2xl border-2 border-ink bg-white p-5"
            >
                <h2 id="emergency-heading" className="text-xl font-semibold">
                    {te ? 'ఇప్పుడే సహాయం కావాలా?' : 'Need urgent help?'}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">
                    {te
                        ? 'భారతదేశంలో అత్యవసర సహాయం కోసం 112కు కాల్ చేయండి. ఈ యాప్ కోసం వేచి ఉండకండి.'
                        : 'In India, call 112 for emergency assistance. Do not wait for this app.'}
                </p>
                <a
                    href="tel:112"
                    className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-ink px-5 text-lg font-semibold text-white focus-visible:outline-2 focus-visible:outline-teal-brand"
                >
                    <Phone className="size-5" aria-hidden="true" />
                    {te ? '112కు కాల్ చేయండి' : 'Call 112'}
                </a>
                <p className="mt-3 text-sm text-ink-soft">
                    {te
                        ? 'పోలీసు, అగ్నిమాపక, వైద్య అత్యవసర సహాయం.'
                        : 'Police, fire and medical emergency assistance.'}
                </p>
            </section>
            {emergency ? (
                <p className="mt-6 text-base leading-relaxed text-ink-soft">
                    {te
                        ? 'స్థానిక ఆసుపత్రులు, ఫార్మసీల నిర్ధారించిన వివరాలు ఇంకా అందుబాటులో లేవు.'
                        : 'Verified local hospital and pharmacy contacts are not available yet.'}
                </p>
            ) : (
                <section className="mt-8">
                    <h2 className="font-display text-2xl">
                        {te ? 'ప్రయాణం ప్రారంభించండి' : 'Let’s get you started'}
                    </h2>
                    <ol className="mt-4 list-decimal space-y-4 pl-5 text-base leading-relaxed text-ink-soft">
                        <li>
                            {te
                                ? 'పైన నగరం, భాషను ఎంచుకోండి.'
                                : 'Choose your city and language at the top of the page.'}
                        </li>
                        <li>
                            {te
                                ? 'ప్రదేశాన్ని ఎంచుకుని ధర, సమయాలు, సూచనలు చూడండి.'
                                : 'Choose a place and check its fee, hours and visiting tips.'}
                        </li>
                        <li>
                            {te
                                ? 'మీ స్థానం లేదా నగర కేంద్రాన్ని ప్రారంభ స్థానంగా ఎంచుకోండి.'
                                : 'Use your location or choose the city centre as your starting point.'}
                        </li>
                        <li>
                            {te
                                ? 'దిశల కోసం Google Maps తెరవండి.'
                                : 'Open Google Maps for directions when you’re ready.'}
                        </li>
                    </ol>
                    <Link
                        href="/attractions"
                        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-amber-brand px-6 font-semibold text-ink focus-visible:outline-2 focus-visible:outline-teal-brand"
                    >
                        {te ? 'ప్రదేశాలు చూడండి' : 'Explore places'}
                    </Link>
                </section>
            )}
        </div>
    )
}
