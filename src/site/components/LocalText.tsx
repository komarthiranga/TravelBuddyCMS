'use client'

import { useChrome } from './locale-provider'

/** Interface copy; editorial content keeps its original language. */
export function LocalText({ en, te }: { en: string; te: string }) {
    const { locale } = useChrome()
    return <span lang={locale}>{locale === 'te' ? te : en}</span>
}

export function TranslationNotice() {
    const { locale } = useChrome()
    if (locale !== 'te') return null
    return (
        <p
            lang="te"
            className="my-4 rounded-xl bg-teal-wash p-4 text-base text-ink"
        >
            ప్రదేశాల పేర్లు, వివరణలు ప్రస్తుతం ఆంగ్లంలో ఉన్నాయి. తెలుగు
            అనువాదాలు ఇంకా అందుబాటులో లేవు.
        </p>
    )
}
