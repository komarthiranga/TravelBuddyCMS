'use client'

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
    return <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 py-12 text-ink">
        <p className="text-sm font-semibold text-teal-brand-dark">Travel Buddy</p>
        <h1 className="mt-3 font-display text-3xl">A little pause in our journey.</h1>
        <p className="mt-4 text-lg">I couldn’t load this page. Please try again in a moment.</p>
        <p lang="te" className="mt-3 text-base">ఈ పేజీని తెరవలేకపోయాను. కాసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.</p>
        <button onClick={() => retry()} className="mt-6 min-h-12 self-start rounded-full bg-ink px-6 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-brand">Try again / మళ్లీ ప్రయత్నించండి</button>
    </main>
}
