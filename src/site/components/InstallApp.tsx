'use client'

import {useEffect, useState, useSyncExternalStore} from 'react'
import {Download} from 'lucide-react'
import {useChrome} from './locale-provider'

type InstallEvent = Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>}
function subscribeOnline(callback:()=>void) {window.addEventListener('online',callback);window.addEventListener('offline',callback);return()=>{window.removeEventListener('online',callback);window.removeEventListener('offline',callback)}}
function onlineSnapshot(){return navigator.onLine}
function standaloneSnapshot(){return window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & {standalone?:boolean}).standalone)}
function subscribeStandalone(callback:()=>void){const media=window.matchMedia('(display-mode: standalone)');media.addEventListener('change',callback);window.addEventListener('appinstalled',callback);return()=>{media.removeEventListener('change',callback);window.removeEventListener('appinstalled',callback)}}
export function InstallApp() {
    const {locale}=useChrome();const te=locale==='te'
    const [offer,setOffer]=useState<InstallEvent|null>(null)
    const [busy,setBusy]=useState(false)
    const [message,setMessage]=useState('')
    const online=useSyncExternalStore(subscribeOnline,onlineSnapshot,()=>true)
    const standalone=useSyncExternalStore(subscribeStandalone,standaloneSnapshot,()=>false)
    useEffect(()=>{
        if(process.env.NODE_ENV==='production' && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>console.warn('Travel Buddy offline support could not start.'))
        const receive=(event:Event)=>{event.preventDefault();setOffer(event as InstallEvent)}
        const installed=()=>{setOffer(null);setMessage('Travel Buddy was added to your device.')}
        window.addEventListener('beforeinstallprompt',receive);window.addEventListener('appinstalled',installed)
        return()=>{window.removeEventListener('beforeinstallprompt',receive);window.removeEventListener('appinstalled',installed)}
    },[])
    async function install(){if(!offer)return;setBusy(true);try{await offer.prompt();const result=await offer.userChoice;setMessage(result.outcome==='accepted'?'Installation requested. Follow your browser’s instructions.':'You can add Travel Buddy later.')}catch{setMessage('Use your browser menu to add Travel Buddy to your home screen.')}finally{setOffer(null);setBusy(false)}}
    return <>
        {!online && <p role="status" className="fixed inset-x-0 top-0 z-[100] bg-amber-100 px-4 py-2 text-center text-sm text-ink">{te?'మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. ప్రదేశాలు, దిశల కోసం ఇంటర్నెట్ అవసరం.':'You’re offline. Places and directions need an internet connection.'}</p>}
        {!standalone && <section aria-label="Install Travel Buddy" className="mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8"><div className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
            <h2 className="flex items-center gap-2 font-semibold text-ink"><Download className="size-5 text-teal-brand-dark" aria-hidden="true" />{te?'Travel Buddy మీ హోమ్ స్క్రీన్‌పై':'Keep your local Buddy on your home screen'}</h2>
            <p className="mt-2 text-sm text-ink-soft">{te?'యాప్‌లా తెరవండి. ప్రదేశాలు, దిశల కోసం ఇంటర్నెట్ అవసరం.':'Open it like an app, without an app-store download. Internet is needed for places and directions.'}</p>
            {offer && <button onClick={install} disabled={busy} className="buddy-primary mt-3 min-h-11 rounded-xl px-4 text-sm font-semibold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-teal-brand">{busy?'Opening…':te?'యాప్ జోడించండి':'Install Travel Buddy'}</button>}
            <details className="mt-2 text-sm text-ink-soft"><summary className="min-h-11 cursor-pointer rounded py-3 font-semibold text-teal-brand-dark focus-visible:outline-2 focus-visible:outline-teal-brand">{te?'హోమ్ స్క్రీన్‌కు ఎలా జోడించాలి?':'How to add it to your home screen'}</summary><p><strong>iPhone / iPad:</strong> Open in Safari → Share → Add to Home Screen → Add.</p><p className="mt-2"><strong>Android:</strong> Open in Chrome → browser menu → Install app or Add to Home screen.</p></details>
            {message && <p role="status" className="mt-2 text-sm text-ink-soft">{message}</p>}
        </div></section>}
    </>
}
