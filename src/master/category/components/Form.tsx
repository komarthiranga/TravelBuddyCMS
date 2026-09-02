'use client'

import { useActionState, useState, type FormEvent } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { createCategoryAction } from '@/master/category/api/createCategoryAction'
import { updateCategoryAction } from '@/master/category/api/updateCategoryAction'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
    CATEGORY_LIMITS,
    type CategoryFieldErrors,
    validateCategoryInput,
} from '@/master/category/validation'

type CategoryFormValues = {
    id?: number
    name: string
    type: string
    code: string
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

function CategoryForm({ category }: { category?: CategoryFormValues }) {
    const isEditing = Boolean(category?.id)
    const action = isEditing ? updateCategoryAction : createCategoryAction
    const [state, formAction] = useActionState(action, {})
    const [clientErrors, setClientErrors] = useState<CategoryFieldErrors>({})
    const [editedFields, setEditedFields] = useState<Partial<Record<keyof CategoryFieldErrors, boolean>>>({})

    const fieldError = (field: keyof CategoryFieldErrors) => {
        if (editedFields[field]) {
            return clientErrors[field]
        }

        return clientErrors[field] ?? state.fieldErrors?.[field]
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(event.currentTarget)
        const result = validateCategoryInput({
            name: String(formData.get('name') ?? ''),
            type: String(formData.get('type') ?? ''),
            code: String(formData.get('code') ?? ''),
        })

        if (!result.ok) {
            event.preventDefault()
            setEditedFields({})
            setClientErrors(result.errors)
        }
    }

    const clearFieldError = (field: keyof CategoryFieldErrors) => {
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

    return (
        <form action={formAction} onSubmit={handleSubmit} className="space-y-5" noValidate>
            {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}

            {state.error ? (
                <p
                    role="alert"
                    className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    {state.error}
                </p>
            ) : null}

            <Field
                id="name"
                label="Name"
                hint="What editors will see in the list."
                error={fieldError('name')}
            >
                <Input
                    id="name"
                    name="name"
                    type="text"
                    inputMode="text"
                    required
                    maxLength={CATEGORY_LIMITS.name}
                    autoComplete="off"
                    placeholder="Park"
                    defaultValue={category?.name}
                    aria-invalid={Boolean(fieldError('name'))}
                    aria-describedby={fieldError('name') ? 'name-error' : undefined}
                    onChange={() => clearFieldError('name')}
                />
            </Field>

            <Field
                id="type"
                label="Type"
                hint="A grouping, for example Attraction."
                error={fieldError('type')}
            >
                <Input
                    id="type"
                    name="type"
                    type="text"
                    inputMode="text"
                    required
                    maxLength={CATEGORY_LIMITS.type}
                    autoComplete="off"
                    placeholder="Attraction"
                    defaultValue={category?.type}
                    aria-invalid={Boolean(fieldError('type'))}
                    aria-describedby={fieldError('type') ? 'type-error' : undefined}
                    onChange={() => clearFieldError('type')}
                />
            </Field>

            <Field
                id="code"
                label="Code"
                hint="Unique key. Letters, numbers, and underscores only."
                error={fieldError('code')}
            >
                <Input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="text"
                    required
                    maxLength={CATEGORY_LIMITS.code}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="PARK"
                    className="font-mono uppercase"
                    defaultValue={category?.code}
                    aria-invalid={Boolean(fieldError('code'))}
                    aria-describedby={fieldError('code') ? 'code-error' : undefined}
                    onChange={() => clearFieldError('code')}
                />
            </Field>

            <div className="flex items-center gap-2 border-t pt-4">
                <SubmitButton label={isEditing ? 'Save changes' : 'Create category'} />
                <Link
                    href="/category"
                    className={cn(buttonVariants({ variant: 'outline' }))}
                >
                    Cancel
                </Link>
            </div>
        </form>
    )
}

export default CategoryForm
