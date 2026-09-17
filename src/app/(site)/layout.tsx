import Link from 'next/link'
import { BuddyNavigation } from '@/site/components/BuddyNavigation'
import { InstallApp } from '@/site/components/InstallApp'
import { LocalText } from '@/site/components/LocalText'

import { getSelectedCity } from '@/site/lib/selected-city'
import { BuddyLogo } from '@/site/components/BuddyLogo'
import { CityCentreSync } from '@/site/components/CityCentreSync'
import { LocaleProvider } from '@/site/components/locale-provider'
import { LocationProvider } from '@/site/components/location-provider'
import { MobileNav } from '@/site/components/MobileNav'
import { SiteHeader } from '@/site/components/SiteHeader'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const { cities, city } = await getSelectedCity()

    return (
        <LocationProvider>
            <LocaleProvider>
                {city && (
                    <CityCentreSync
                        name={city.name}
                        latitude={city.latitude}
                        longitude={city.longitude}
                    />
                )}
                <div className="flex min-h-full flex-col bg-cream pb-[calc(4rem+env(safe-area-inset-bottom))] text-ink md:pb-0">
                    <a
                        href="#main"
                        className="sr-only rounded-full bg-ink px-5 py-3 text-base font-semibold text-white focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100]"
                    >
                        Skip to main content
                    </a>

                    <SiteHeader cities={cities} activeCityName={city?.name ?? 'Eluru'} />

                    <main id="main" className="flex-1">
                        <BuddyNavigation />
                        {children}
                    </main>

                    <InstallApp />
                    <footer className="mt-8 border-t border-hairline bg-ink text-white">
                        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
                            <div>
                                <BuddyLogo size="md" tone="dark" />
                                <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80">
                                    <LocalText en="A local friend in your pocket — places to explore, directions and practical visiting tips." te="మీ స్థానిక స్నేహితుడు — చూడదగిన ప్రదేశాలు, దిశలు, ఉపయోగకరమైన సందర్శన సూచనలు." />
                                </p>
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">
                                    <LocalText en="Explore" te="చూడండి" />
                                </h2>
                                <ul className="mt-4 space-y-2.5">
                                    <li>
                                        <Link
                                            href="/attractions"
                                            className="text-base text-white/85 outline-none hover:text-white focus-visible:underline"
                                        >
                                            <LocalText en="Explore places" te="ప్రదేశాలు చూడండి" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/guide"
                                            className="text-base text-white/85 outline-none hover:text-white focus-visible:underline"
                                        >
                                            <LocalText en="Guide me" te="ఎంచుకోవడంలో సహాయం" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/help"
                                            className="text-base text-white/85 outline-none hover:text-white focus-visible:underline"
                                        >
                                            <LocalText en="Help" te="సహాయం" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">
                                    <LocalText en="More information" te="మరింత సమాచారం" />
                                </h2>
                                <ul className="mt-4 space-y-2.5 text-base text-white/85">
                                    <li>
                                        <Link href="/food" className="hover:text-white">
                                            <LocalText en="Eat" te="ఆహారం" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/hotels" className="hover:text-white">
                                            <LocalText en="Stay" te="హోటళ్లు" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/transport" className="hover:text-white">
                                            <LocalText en="Travel" te="రవాణా" />
                                        </Link>
                                    </li>
                                    <li><Link href="/essentials" className="inline-flex min-h-11 items-center hover:text-white focus-visible:underline"><LocalText en="Essentials" te="రోజువారీ అవసరాలు" /></Link></li>
                                    <li><Link href="/services" className="inline-flex min-h-11 items-center hover:text-white focus-visible:underline"><LocalText en="Local services" te="స్థానిక సేవలు" /></Link></li>
                                    <li>
                                        <Link href="/emergency" className="hover:text-white">
                                            <LocalText en="Emergency help" te="అత్యవసర సహాయం" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-white/10">
                            <p className="mx-auto w-full max-w-6xl px-5 py-6 text-sm text-white/70 sm:px-8">
                                © {new Date().getFullYear()} TravelBuddy
                            </p>
                        </div>
                    </footer>

                    <MobileNav />
                </div>
            </LocaleProvider>
        </LocationProvider>
    )
}
