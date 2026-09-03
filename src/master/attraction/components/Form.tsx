'use client'

import { useActionState, useState, type FormEvent } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { createAttractionAction } from '@/master/attraction/api/createAttractionAction'
import { updateAttractionAction } from '@/master/attraction/api/updateAttractionAction'
import { ATTRACTION_STATUSES, type SelectOption } from '@/master/attraction/types'
import {
    ATTRACTION_LIMITS,
    type AttractionFieldErrors,
    validateAttractionInput,
} from '@/master/attraction/validation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type AttractionFormValues = {
    id?: number
    short_name: string
    full_name: string
    slug: string
    address: string
    city_id: number | ''
    category_id: number | ''
    latitude: string
    longitude: string
    entry_fee: string
    currency_code: string
    opening_time: string
    closing_time: string
    best_time_to_visit: string
    travel_modes: string
    short_description: string
    full_description: string
    instructions: string
    status: string
    is_active: boolean
}

const selectClassName =
    'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
const textareaClassName =
    'min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

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

function AttractionForm({
    attraction,
    cities,
    categories,
}: {
    attraction?: AttractionFormValues
    cities: SelectOption[]
    categories: SelectOption[]
}) {
    const isEditing = Boolean(attraction?.id)
    const action = isEditing ? updateAttractionAction : createAttractionAction
    const [state, formAction] = useActionState(action, {})
    const [clientErrors, setClientErrors] = useState<AttractionFieldErrors>({})
    const [editedFields, setEditedFields] = useState<Partial<Record<keyof AttractionFieldErrors, boolean>>>({})

    const fieldError = (field: keyof AttractionFieldErrors) => {
        if (editedFields[field]) {
            return clientErrors[field]
        }

        return clientErrors[field] ?? state.fieldErrors?.[field]
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(event.currentTarget)
        const result = validateAttractionInput({
            short_name: String(formData.get('short_name') ?? ''),
            full_name: String(formData.get('full_name') ?? ''),
            slug: String(formData.get('slug') ?? ''),
            address: String(formData.get('address') ?? ''),
            city_id: String(formData.get('city_id') ?? ''),
            category_id: String(formData.get('category_id') ?? ''),
            latitude: String(formData.get('latitude') ?? ''),
            longitude: String(formData.get('longitude') ?? ''),
            entry_fee: String(formData.get('entry_fee') ?? ''),
            currency_code: String(formData.get('currency_code') ?? ''),
            opening_time: String(formData.get('opening_time') ?? ''),
            closing_time: String(formData.get('closing_time') ?? ''),
            best_time_to_visit: String(formData.get('best_time_to_visit') ?? ''),
            travel_modes: String(formData.get('travel_modes') ?? ''),
            short_description: String(formData.get('short_description') ?? ''),
            full_description: String(formData.get('full_description') ?? ''),
            instructions: String(formData.get('instructions') ?? ''),
            status: String(formData.get('status') ?? ''),
            is_active: formData.get('is_active') === 'true',
        })

        if (!result.ok) {
            event.preventDefault()
            setEditedFields({})
            setClientErrors(result.errors)
        }
    }

    const clearFieldError = (field: keyof AttractionFieldErrors) => {
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
            {attraction?.id ? <input type="hidden" name="id" value={attraction.id} /> : null}

            {state.error ? (
                <p
                    role="alert"
                    className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    {state.error}
                </p>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
                <Field id="short_name" label="Short name" error={fieldError('short_name')}>
                    <Input
                        id="short_name"
                        name="short_name"
                        required
                        maxLength={ATTRACTION_LIMITS.short_name}
                        placeholder="Tea Museum"
                        defaultValue={attraction?.short_name}
                        aria-invalid={Boolean(fieldError('short_name'))}
                        onChange={() => clearFieldError('short_name')}
                    />
                </Field>
                <Field id="slug" label="Slug" hint="Lowercase, hyphens only." error={fieldError('slug')}>
                    <Input
                        id="slug"
                        name="slug"
                        required
                        maxLength={ATTRACTION_LIMITS.slug}
                        placeholder="tea-museum"
                        className="font-mono"
                        defaultValue={attraction?.slug}
                        aria-invalid={Boolean(fieldError('slug'))}
                        onChange={() => clearFieldError('slug')}
                    />
                </Field>
            </div>

            <Field id="full_name" label="Full name" error={fieldError('full_name')}>
                <Input
                    id="full_name"
                    name="full_name"
                    required
                    maxLength={ATTRACTION_LIMITS.full_name}
                    placeholder="KDHP Tea Museum"
                    defaultValue={attraction?.full_name}
                    aria-invalid={Boolean(fieldError('full_name'))}
                    onChange={() => clearFieldError('full_name')}
                />
            </Field>

            <Field id="address" label="Address" error={fieldError('address')}>
                <textarea
                    id="address"
                    name="address"
                    required
                    defaultValue={attraction?.address}
                    aria-invalid={Boolean(fieldError('address'))}
                    onChange={() => clearFieldError('address')}
                    className={textareaClassName}
                />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field id="city_id" label="City" error={fieldError('city_id')}>
                    <select
                        id="city_id"
                        name="city_id"
                        required
                        defaultValue={attraction?.city_id ?? ''}
                        aria-invalid={Boolean(fieldError('city_id'))}
                        onChange={() => clearFieldError('city_id')}
                        className={selectClassName}
                    >
                        <option value="">Select city</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field id="category_id" label="Category" error={fieldError('category_id')}>
                    <select
                        id="category_id"
                        name="category_id"
                        required
                        defaultValue={attraction?.category_id ?? ''}
                        aria-invalid={Boolean(fieldError('category_id'))}
                        onChange={() => clearFieldError('category_id')}
                        className={selectClassName}
                    >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field id="latitude" label="Latitude" hint="Optional." error={fieldError('latitude')}>
                    <Input
                        id="latitude"
                        name="latitude"
                        inputMode="decimal"
                        defaultValue={attraction?.latitude}
                        onChange={() => clearFieldError('latitude')}
                    />
                </Field>
                <Field id="longitude" label="Longitude" hint="Optional." error={fieldError('longitude')}>
                    <Input
                        id="longitude"
                        name="longitude"
                        inputMode="decimal"
                        defaultValue={attraction?.longitude}
                        onChange={() => clearFieldError('longitude')}
                    />
                </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
                <Field id="entry_fee" label="Entry fee" error={fieldError('entry_fee')}>
                    <Input
                        id="entry_fee"
                        name="entry_fee"
                        inputMode="decimal"
                        defaultValue={attraction?.entry_fee ?? '0'}
                        onChange={() => clearFieldError('entry_fee')}
                    />
                </Field>
                <Field id="currency_code" label="Currency" error={fieldError('currency_code')}>
                    <Input
                        id="currency_code"
                        name="currency_code"
                        maxLength={3}
                        defaultValue={attraction?.currency_code ?? 'INR'}
                        className="font-mono uppercase"
                        onChange={() => clearFieldError('currency_code')}
                    />
                </Field>
                <Field id="status" label="Status" error={fieldError('status')}>
                    <select
                        id="status"
                        name="status"
                        defaultValue={attraction?.status ?? 'DRAFT'}
                        className={selectClassName}
                        onChange={() => clearFieldError('status')}
                    >
                        {ATTRACTION_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field id="opening_time" label="Opening time" hint="Optional." error={fieldError('opening_time')}>
                    <Input
                        id="opening_time"
                        name="opening_time"
                        type="time"
                        defaultValue={attraction?.opening_time}
                        onChange={() => clearFieldError('opening_time')}
                    />
                </Field>
                <Field id="closing_time" label="Closing time" hint="Optional." error={fieldError('closing_time')}>
                    <Input
                        id="closing_time"
                        name="closing_time"
                        type="time"
                        defaultValue={attraction?.closing_time}
                        onChange={() => clearFieldError('closing_time')}
                    />
                </Field>
            </div>

            <Field id="best_time_to_visit" label="Best time to visit" hint="Optional." error={fieldError('best_time_to_visit')}>
                <Input
                    id="best_time_to_visit"
                    name="best_time_to_visit"
                    maxLength={ATTRACTION_LIMITS.best_time_to_visit}
                    placeholder="October to March"
                    defaultValue={attraction?.best_time_to_visit}
                    onChange={() => clearFieldError('best_time_to_visit')}
                />
            </Field>

            <Field
                id="travel_modes"
                label="Travel modes"
                hint="Optional. Comma separated, for example Bus, Taxi, Walk."
            >
                <Input
                    id="travel_modes"
                    name="travel_modes"
                    placeholder="Bus, Taxi, Walk"
                    defaultValue={attraction?.travel_modes}
                />
            </Field>

            <Field id="short_description" label="Short description" error={fieldError('short_description')}>
                <textarea
                    id="short_description"
                    name="short_description"
                    required
                    maxLength={ATTRACTION_LIMITS.short_description}
                    defaultValue={attraction?.short_description}
                    aria-invalid={Boolean(fieldError('short_description'))}
                    onChange={() => clearFieldError('short_description')}
                    className={textareaClassName}
                />
            </Field>

            <Field id="full_description" label="Full description" hint="Optional.">
                <textarea
                    id="full_description"
                    name="full_description"
                    defaultValue={attraction?.full_description}
                    className={textareaClassName}
                />
            </Field>

            <Field id="instructions" label="Instructions" hint="Optional.">
                <textarea
                    id="instructions"
                    name="instructions"
                    defaultValue={attraction?.instructions}
                    className={textareaClassName}
                />
            </Field>

            <label className="flex items-center gap-2 text-sm font-medium">
                <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked={attraction?.is_active ?? true}
                    className="size-4 rounded border-input"
                />
                Active
            </label>

            <div className="flex items-center gap-2 border-t pt-4">
                <SubmitButton label={isEditing ? 'Save changes' : 'Create attraction'} />
                <Link href="/attraction" className={cn(buttonVariants({ variant: 'outline' }))}>
                    Cancel
                </Link>
            </div>
        </form>
    )
}

export default AttractionForm
