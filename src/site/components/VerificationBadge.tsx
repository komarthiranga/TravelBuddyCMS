'use client'

import { ShieldCheck, MapPinCheck, Info, TriangleAlert } from 'lucide-react'
import type { Verification } from '@/site/verification/model'
import { useChrome } from './locale-provider'

const names = { name: 'Place name', address: 'Address', coordinates: 'Map pin', hours: 'Opening hours', admission: 'Admission fee' }
const teluguNames = { name: 'ప్రదేశం పేరు', address: 'చిరునామా', coordinates: 'మ్యాప్ స్థానం', hours: 'ప్రారంభ సమయాలు', admission: 'ప్రవేశ రుసుము' }

export function VerificationBadge({ verification, compact = false }: { verification: Verification; compact?: boolean }) {
    const { locale } = useChrome()
    const te = locale === 'te'
    const locationChecked = verification.checks.some(check => check.field === 'address')
    const Icon = verification.status === 'verified' ? ShieldCheck : locationChecked ? MapPinCheck : Info
    const label = verification.status === 'verified'
        ? (te ? 'వివరాలు నిర్ధారించబడ్డాయి' : 'Details verified')
        : locationChecked
            ? (te ? 'ప్రదేశం నిర్ధారించబడింది' : 'Location confirmed')
        : compact
            ? (te ? 'వెళ్లే ముందు వివరాలు తెలుసుకోండి' : 'Check details before visiting')
            : (te ? 'వెళ్లే ముందు' : 'Before you go')
    const badge = <><Icon className="size-4 shrink-0" aria-hidden="true" /><span>{label}</span></>
    if (compact) return <span lang={locale} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">{badge}</span>
    return <details lang={locale} className="relative z-10 mt-2 text-sm">
        <summary className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 py-2 font-medium focus-visible:outline-2 focus-visible:outline-teal-brand ${verification.status === 'verified' || locationChecked ? 'bg-teal-wash text-teal-brand-dark' : 'text-ink-soft hover:bg-teal-wash'}`}>{badge}<span aria-hidden="true">⌄</span></summary>
        <div className="mt-2 rounded-xl border border-hairline bg-white p-3 text-ink-soft">
            <p className="leading-relaxed">{verification.status === 'verified'
                ? (te ? 'క్రింద చూపిన మూలాలతో సందర్శన వివరాలను తనిఖీ చేశాము.' : 'We checked the visiting details against the sources below.')
                : verification.status === 'partial'
                    ? (te ? 'కొన్ని వివరాలను తనిఖీ చేశాము. వెళ్లే ముందు మిగిలిన వివరాలను తెలుసుకోండి.' : 'We’ve checked some details. Here’s what to double-check before your visit.')
                    : (te ? 'ఈ సందర్శన వివరాలను ఇంకా తనిఖీ చేయలేదు. బయలుదేరే ముందు నిర్వాహకులతో తెలుసుకోండి.' : 'We haven’t checked these visiting details yet. Please check with the venue before setting out.')}</p>
            {locationChecked && verification.status !== 'verified' && <p className="mt-2 leading-relaxed">{te ? 'ఇది చిరునామా ఉన్న ప్రాంతాన్ని మాత్రమే నిర్ధారిస్తుంది. ఖచ్చితమైన ప్రవేశ స్థానం, సమయాలు, ధరలు వేరుగా తనిఖీ చేయాలి.' : 'Location refers to the listed address area. It does not confirm the exact entrance, opening hours or prices.'}</p>}
            {verification.checks.length > 0 && <ul className="mt-3 space-y-2">{verification.checks.map(check => <li key={check.field}>
                <a className="inline-flex min-h-11 items-center rounded font-medium text-teal-brand-dark underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-brand" href={check.source_url} target="_blank" rel="noopener noreferrer">{(te ? teluguNames : names)[check.field]} — {te ? 'మూలం చూడండి' : 'View source'}<span className="sr-only">{te ? ' (కొత్త ట్యాబ్)' : ' (opens a new tab)'}</span></a>
                <span className="block text-xs">{te ? 'తనిఖీ చేసిన తేదీ: ' : 'Checked: '}{new Date(check.checked_at).toISOString().slice(0,10)}</span>
            </li>)}</ul>}
            {verification.pending.length > 0 && <p className="mt-3">{te ? 'ఇంకా నిర్ధారించాల్సినవి: ' : 'Please check: '}{verification.pending.map(field => (te ? teluguNames : names)[field]).join(', ')}.</p>}
            {verification.issues.length > 0 && <ul className="mt-3 space-y-3">{verification.issues.map(issue => <li key={issue.field} className="rounded-lg bg-amber-50 p-3">
                <p className="flex items-center gap-2 font-medium text-ink"><TriangleAlert className="size-4 shrink-0" aria-hidden="true" />{(te ? teluguNames : names)[issue.field]}</p>
                <p lang="en" className="mt-1 leading-relaxed">{issue.notes}</p>
                <a href={issue.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded text-teal-brand-dark underline focus-visible:outline-2 focus-visible:outline-teal-brand">{te ? 'మూలం చూడండి' : 'View source'}<span className="sr-only">{te ? ' (కొత్త ట్యాబ్)' : ' (opens a new tab)'}</span></a>
                <p className="text-xs">{te ? 'తనిఖీ చేసిన తేదీ: ' : 'Reviewed: '}{new Date(issue.checked_at).toISOString().slice(0,10)}</p>
            </li>)}</ul>}
            <p className="mt-3 text-xs">{te ? 'ఈ తనిఖీలు సందర్శన సమాచారం గురించి మాత్రమే; భద్రతకు హామీ కాదు. సమయాలు, ధరలు మారవచ్చు.' : 'These checks cover visiting information, not venue safety. Hours and prices can change.'}</p>
        </div>
    </details>
}
