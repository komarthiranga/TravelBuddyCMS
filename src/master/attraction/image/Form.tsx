'use client'

import { useActionState, useState, type FormEvent } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import type { ReactNode } from 'react'

import {
    createAttractionImageAction,
    updateAttractionImageAction,
} from '@/master/attraction/image/actions'
import {
    IMAGE_LIMITS,
    type AttractionImageFieldErrors,
    validateAttractionImageInput,
} from '@/master/attraction/image/validation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type ImageFormValues = {
    id?: number
    attraction_id: number
    image_url: string
    public_id: string
    alt_text: string
    display_order: number
    is_primary: boolean
}

function Field({
    id,
    label,
    hint,
    error,
    children,
}: {
    id: string
    label: string
    hint?: string
    error?: string
    children: ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            {children}
            {error ? (
                <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
                    {error}
                </p>
            ) : hint ? (
                <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
        </div>
    )
}

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : label}
        </Button>
    )
}

function AttractionImageForm({ image }: { image: ImageFormValues }) {
    const isEditing = Boolean(image.id)
    const action = isEditing ? updateAttractionImageAction : createAttractionImageAction
    const [state, formAction] = useActionState(action, {})
    const [clientErrors, setClientErrors] = useState<AttractionImageFieldErrors>({})
    const [editedFields, setEditedFields] = useState<Partial<Record<keyof AttractionImageFieldErrors, boolean>>>({})

    const fieldError = (field: keyof AttractionImageFieldErrors) => {
        if (editedFields[field]) {
            return clientErrors[field]
        }

        return clientErrors[field] ?? state.fieldErrors?.[field]
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(event.currentTarget)
        const result = validateAttractionImageInput({
            attraction_id: String(formData.get('attraction_id') ?? ''),
            image_url: String(formData.get('image_url') ?? ''),
            public_id: String(formData.get('public_id') ?? ''),
            alt_text: String(formData.get('alt_text') ?? ''),
            display_order: String(formData.get('display_order') ?? ''),
            is_primary: formData.get('is_primary') === 'true',
        })

        if (!result.ok) {
            event.preventDefault()
            setEditedFields({})
            setClientErrors(result.errors)
        }
    }

    const clearFieldError = (field: keyof AttractionImageFieldErrors) => {
        setEditedFields((current) => ({ ...current, [field]: true }))
        setClientErrors((current) => {
            if (!current[field]) {
                return current
            }

            const next = { ...current }
            delete next[field]
            return next
        })
    }

    const cancelHref = `/attraction/${image.attraction_id}`

    return (
        <form action={formAction} onSubmit={handleSubmit} className="space-y-5" noValidate>
            <input type="hidden" name="attraction_id" value={image.attraction_id} />
            {image.id ? <input type="hidden" name="id" value={image.id} /> : null}

            {state.error ? (
                <p
                    role="alert"
                    className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    {state.error}
                </p>
            ) : null}

            <Field id="image_url" label="Image URL" hint="Must start with http:// or https://." error={fieldError('image_url')}>
                <Input
                    id="image_url"
                    name="image_url"
                    required
                    placeholder="https://..."
                    defaultValue={image.image_url}
                    aria-invalid={Boolean(fieldError('image_url'))}
                    onChange={() => clearFieldError('image_url')}
                />
            </Field>

            <Field
                id="public_id"
                label="Public ID"
                hint="Unique storage key, for example a Cloudinary public ID."
                error={fieldError('public_id')}
            >
                <Input
                    id="public_id"
                    name="public_id"
                    required
                    maxLength={IMAGE_LIMITS.public_id}
                    className="font-mono"
                    defaultValue={image.public_id}
                    aria-invalid={Boolean(fieldError('public_id'))}
                    onChange={() => clearFieldError('public_id')}
                />
            </Field>

            <Field id="alt_text" label="Alt text" hint="Optional. Describe the image for accessibility." error={fieldError('alt_text')}>
                <Input
                    id="alt_text"
                    name="alt_text"
                    maxLength={IMAGE_LIMITS.alt_text}
                    defaultValue={image.alt_text}
                    aria-invalid={Boolean(fieldError('alt_text'))}
                    onChange={() => clearFieldError('alt_text')}
                />
            </Field>

            <Field id="display_order" label="Display order" hint="Lower numbers appear first." error={fieldError('display_order')}>
                <Input
                    id="display_order"
                    name="display_order"
                    inputMode="numeric"
                    defaultValue={String(image.display_order)}
                    aria-invalid={Boolean(fieldError('display_order'))}
                    onChange={() => clearFieldError('display_order')}
                />
            </Field>

            <label className="flex items-center gap-2 text-sm font-medium">
                <input
                    type="checkbox"
                    name="is_primary"
                    value="true"
                    defaultChecked={image.is_primary}
                    className="size-4 rounded border-input"
                />
                Primary image
            </label>

            <div className="flex items-center gap-2 border-t pt-4">
                <SubmitButton label={isEditing ? 'Save image' : 'Add image'} />
                <Link href={cancelHref} className={cn(buttonVariants({ variant: 'outline' }))}>
                    Cancel
                </Link>
            </div>
        </form>
    )
}

export default AttractionImageForm
