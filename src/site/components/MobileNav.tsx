'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Compass, Bookmark, LocateFixed, LifeBuoy } from 'lucide-react'
import { useOnline } from '@/site/online/OnlineProvider'
import styles from '@/site/online/discovery.module.css'

export function MobileNav() {
    const path = usePathname()
    const router = useRouter()
    const { requestLocation, locating } = useOnline()
    return <nav className={styles.mobileNav} aria-label="Mobile navigation">
        <Link href="/" aria-current={!['/saved','/help','/emergency'].includes(path) ? 'page' : undefined}><Compass/>Discover</Link>
        <button onClick={() => { requestLocation(); router.push('/') }} disabled={locating}><LocateFixed/>{locating ? 'Locating…' : 'Near me'}</button>
        <Link href="/saved" aria-current={path === '/saved' ? 'page' : undefined}><Bookmark/>Collection</Link>
        <Link href="/help" aria-current={['/help','/emergency'].includes(path) ? 'page' : undefined}><LifeBuoy/>Help</Link>
    </nav>
}
