'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BedDouble, Utensils, Bus, ShoppingBag, Compass, LifeBuoy, ArrowUpRight } from 'lucide-react'
import { useChrome } from './locale-provider'
import styles from './buddy-navigation.module.css'

const choices = [
    { href: '/hotels', label: 'Stay', te: 'వసతి', hint: 'Find your place', hintTe: 'ఉండటానికి చోటు', icon: BedDouble, routes: ['/hotels'] },
    { href: '/food', label: 'Eat', te: 'భోజనం', hint: 'Find a local bite', hintTe: 'భోజన ప్రదేశాలు', icon: Utensils, routes: ['/food'] },
    { href: '/transport', label: 'Travel', te: 'ప్రయాణం', hint: 'Get around easily', hintTe: 'రవాణా మార్గాలు', icon: Bus, routes: ['/transport', '/guide'] },
    { href: '/essentials', label: 'Essentials', te: 'అవసరాలు', hint: 'Sort everyday needs', hintTe: 'రోజువారీ అవసరాలు', icon: ShoppingBag, routes: ['/essentials', '/services', '/online'] },
    { href: '/attractions', label: 'Explore', te: 'చూడండి', hint: 'Discover your city', hintTe: 'నగరాన్ని తెలుసుకోండి', icon: Compass, routes: ['/attractions'] },
    { href: '/help', label: 'Get help', te: 'సహాయం', hint: 'Find support', hintTe: 'సహాయం పొందండి', icon: LifeBuoy, routes: ['/help', '/emergency'] },
]

export function BuddyNavigation({ placement = 'layout' }: { placement?: 'layout' | 'home' }) {
    const pathname = usePathname()
    const { locale } = useChrome()
    const te = locale === 'te'
    const home = pathname === '/'
    if (home && placement === 'layout') return null
    if (!home && placement === 'home') return null
    return <section id={home ? 'your-city' : undefined} aria-label={te ? 'మీ స్థానిక బడ్డీ' : 'Your local buddy'} lang={locale} className={home ? styles.homeChoices : "mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8"}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl text-ink sm:text-2xl">{te ? 'తర్వాత మీకు ఏమి కావాలి?' : 'What do you need next?'}</h2>
            <Link href="/emergency" className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#963d30] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#963d30]">{te ? 'అత్యవసర సహాయం' : 'Emergency help'}<ArrowUpRight size={14} aria-hidden="true" /></Link>
        </div>
        <nav aria-label={te ? 'నగరంలో అవసరాలు' : 'City essentials'} className={home ? styles.grid : "grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3"}>
            {choices.map(({ href, label, te: translated, hint, hintTe, icon: Icon, routes }) => {
                const active = !home && routes.some(route => pathname === route || pathname.startsWith(`${route}/`))
                return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`${home ? styles.choice : ''} group flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-4 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-brand ${active ? 'border-[#204b3c] bg-[#204b3c] text-white' : 'border-[#dfe4d8] bg-white text-ink hover:border-[#9caf91] hover:bg-[#f0f4eb]'}`}>
                    <Icon size={23} strokeWidth={1.6} aria-hidden="true" /><span className="text-sm font-semibold">{te ? translated : label}</span><span className={`${home ? styles.hint : 'hidden'} text-[10px] leading-4 sm:block ${active ? 'text-white/80' : 'text-ink-soft'}`}>{te ? hintTe : hint}</span>
                </Link>
            })}
        </nav>
        {home && <p className="mt-3 text-xs leading-6 text-ink-soft">{te ? 'కొత్తగా వచ్చారా? వసతితో మొదలుపెట్టండి లేదా మీకు కావాల్సింది ఎంచుకోండి.' : 'One city. Everything you need to feel at home.'}</p>}
    </section>
}
