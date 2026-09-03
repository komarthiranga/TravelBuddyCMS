'use client'

import { useActionState, useState, type FormEvent } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { createCityAction } from '@/master/city/api/createCityAction'
import { updateCityAction } from '@/master/city/api/updateCityAction'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
    CITY_LIMITS,
    type CityFieldErrors,
    validateCityInput,
} from '@/master/city/validation'

type CityFormValues = {
    id?: number
    name: string
    code: string
    state: string
    country: string
    latitude: string
    longitude: string
    is_active: boolean
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

function CityForm({ city }: { city?: CityFormValues }) {
    const isEditing = Boolean(city?.id)
    const action = isEditing ? updateCityAction : createCityAction
    const [state, formAction] = useActionState(action, {})
    const [clientErrors, setClientErrors] = useState<CityFieldErrors>({})
    const [editedFields, setEditedFields] = useState<Partial<Record<keyof CityFieldErrors, boolean>>>({})

    const fieldError = (field: keyof CityFieldErrors) => {
        if (editedFields[field]) {
            return clientErrors[field]
        }

        return clientErrors[field] ?? state.fieldErrors?.[field]
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(event.currentTarget)
        const result = validateCityInput({
            name: String(formData.get('name') ?? ''),
            code: String(formData.get('code') ?? ''),
            state: String(formData.get('state') ?? ''),
            country: String(formData.get('country') ?? ''),
            latitude: String(formData.get('latitude') ?? ''),
            longitude: String(formData.get('longitude') ?? ''),
            is_active: formData.get('is_active') === 'true',
        })

        if (!result.ok) {
            event.preventDefault()
            setEditedFields({})
            setClientErrors(result.errors)
        }
    }

    const clearFieldError = (field: keyof CityFieldErrors) => {
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
            {city?.id ? <input type="hidden" name="id" value={city.id} /> : null}

            {state.error ? (
                <p
                    role="alert"
                    className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    {state.error}
                </p>
            ) : null}

            <Field id="name" label="Name" hint="City name shown in the list." error={fieldError('name')}>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={CITY_LIMITS.name}
                    autoComplete="off"
                    placeholder="Munnar"
                    defaultValue={city?.name}
                    aria-invalid={Boolean(fieldError('name'))}
                    aria-describedby={fieldError('name') ? 'name-error' : undefined}
                    onChange={() => clearFieldError('name')}
                />
            </Field>

            <Field id="code" label="Code" hint="Unique key. Letters, numbers, and underscores only." error={fieldError('code')}>
                <Input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxLength={CITY_LIMITS.code}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="MUNNAR"
                    className="font-mono uppercase"
                    defaultValue={city?.code}
                    aria-invalid={Boolean(fieldError('code'))}
                    aria-describedby={fieldError('code') ? 'code-error' : undefined}
                    onChange={() => clearFieldError('code')}
                />
            </Field>

            <Field id="state" label="State" error={fieldError('state')}>
                <Input
                    id="state"
                    name="state"
                    type="text"
                    required
                    maxLength={CITY_LIMITS.state}
                    autoComplete="off"
                    placeholder="Kerala"
                    defaultValue={city?.state}
                    aria-invalid={Boolean(fieldError('state'))}
                    aria-describedby={fieldError('state') ? 'state-error' : undefined}
                    onChange={() => clearFieldError('state')}
                />
            </Field>

            <Field id="country" label="Country" error={fieldError('country')}>
                <Input
                    id="country"
                    name="country"
                    type="text"
                    required
                    maxLength={CITY_LIMITS.country}
                    autoComplete="off"
                    placeholder="India"
                    defaultValue={city?.country}
                    aria-invalid={Boolean(fieldError('country'))}
                    aria-describedby={fieldError('country') ? 'country-error' : undefined}
                    onChange={() => clearFieldError('country')}
                />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field id="latitude" label="Latitude" hint="Optional. Between -90 and 90." error={fieldError('latitude')}>
                    <Input
                        id="latitude"
                        name="latitude"
                        type="text"
                        inputMode="decimal"
                        placeholder="10.088900"
                        defaultValue={city?.latitude}
                        aria-invalid={Boolean(fieldError('latitude'))}
                        aria-describedby={fieldError('latitude') ? 'latitude-error' : undefined}
                        onChange={() => clearFieldError('latitude')}
                    />
                </Field>
                <Field id="longitude" label="Longitude" hint="Optional. Between -180 and 180." error={fieldError('longitude')}>
                    <Input
                        id="longitude"
                        name="longitude"
                        type="text"
                        inputMode="decimal"
                        placeholder="77.059500"
                        defaultValue={city?.longitude}
                        aria-invalid={Boolean(fieldError('longitude'))}
                        aria-describedby={fieldError('longitude') ? 'longitude-error' : undefined}
                        onChange={() => clearFieldError('longitude')}
                    />
                </Field>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
                <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked={city?.is_active ?? true}
                    className="size-4 rounded border-input"
                />
                Active
            </label>

            <div className="flex items-center gap-2 border-t pt-4">
                <SubmitButton label={isEditing ? 'Save changes' : 'Create city'} />
                <Link href="/city" className={cn(buttonVariants({ variant: 'outline' }))}>
                    Cancel
                </Link>
            </div>
        </form>
    )
}

export default CityForm
