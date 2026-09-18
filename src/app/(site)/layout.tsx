import Link from 'next/link'
import { auth } from '@/auth'
import { OnlineProvider } from '@/site/online/OnlineProvider'
import { OnlineHeader } from '@/site/online/OnlineHeader'
import { LocaleProvider } from '@/site/components/locale-provider'
import { MobileNav } from '@/site/components/MobileNav'
import { InstallApp } from '@/site/components/InstallApp'
import styles from '@/site/online/discovery.module.css'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    return <LocaleProvider><OnlineProvider session={session}>
        <div className={styles.shell}>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:p-4">Skip to main content</a>
            <OnlineHeader/>
            <main id="main">{children}</main>
            <InstallApp/>
            <footer className={styles.footer}><span>© {new Date().getFullYear()} TravelBuddy · A little local, wherever you go.</span><div><Link href="/help">Need a hand?</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></footer>
            <MobileNav/>
        </div>
    </OnlineProvider></LocaleProvider>
}
