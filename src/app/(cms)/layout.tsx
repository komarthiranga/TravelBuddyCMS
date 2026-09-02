import { SidebarNav } from '@/components/cms/sidebar-nav'

function CMSLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-full flex-col bg-background md:flex-row">
            <SidebarNav />
            <div className="min-w-0 flex-1 bg-muted/30">
                <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    )
}

export default CMSLayout
