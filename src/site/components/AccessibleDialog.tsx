'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useChrome } from './locale-provider'

/** The native modal makes the background inert and contains keyboard focus. */
export function AccessibleDialog({
    label,
    onClose,
    children,
}: {
    label: string
    onClose: () => void
    children: ReactNode
}) {
    const ref = useRef<HTMLDialogElement>(null)
    const { locale } = useChrome()
    useEffect(() => {
        const dialog = ref.current
        const trigger =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null
        const overflow = document.body.style.overflow
        dialog?.showModal()
        document.body.style.overflow = 'hidden'
        return () => {
            dialog?.close()
            document.body.style.overflow = overflow
            if (trigger?.isConnected) trigger.focus()
        }
    }, [])
    return createPortal(
        <dialog
            ref={ref}
            aria-label={label}
            onKeyDown={(event) => {
                if (event.key !== 'Tab') return
                const controls = Array.from(
                    event.currentTarget.querySelectorAll<HTMLElement>(
                        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
                    ),
                )
                const first = controls[0]
                const last = controls[controls.length - 1]
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault()
                    last?.focus()
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault()
                    first?.focus()
                }
            }}
            onCancel={(event) => {
                event.preventDefault()
                onClose()
            }}
            className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-hairline bg-cream p-5 text-ink shadow-card-hover backdrop:bg-ink/70 sm:p-7"
        >
            <div className="mb-3 flex justify-end">
                <button
                    type="button"
                    autoFocus
                    onClick={onClose}
                    aria-label={locale === 'te' ? 'మూసివేయండి' : 'Close'}
                    className="inline-flex size-12 items-center justify-center rounded-full border border-ink/20 bg-white focus-visible:outline-2 focus-visible:outline-teal-brand"
                >
                    <X aria-hidden="true" className="size-5" />
                </button>
            </div>
            {children}
        </dialog>,
        document.body,
    )
}
