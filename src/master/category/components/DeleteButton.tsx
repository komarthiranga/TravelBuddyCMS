'use client'

import { useFormStatus } from 'react-dom'
import { Loader2Icon, Trash2 } from 'lucide-react'

import { deleteCategoryAction } from '@/master/category/api/deleteCategoryAction'
import { Button } from '@/components/ui/button'

function DeleteSubmitButton({ name }: { name: string }) {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            variant="ghost"
            size="icon-xs"
            disabled={pending}
            aria-label={pending ? `Deleting ${name}` : `Delete ${name}`}
            title="Delete"
        >
            {pending ? (
                <Loader2Icon className="animate-spin" />
            ) : (
                <Trash2 className="text-destructive" />
            )}
        </Button>
    )
}

function DeleteCategoryButton({ id, name }: { id: number; name: string }) {
    return (
        <form
            action={deleteCategoryAction}
            onSubmit={(event) => {
                const confirmed = window.confirm(
                    `Delete “${name}”? This cannot be undone.`
                )

                if (!confirmed) {
                    event.preventDefault()
                }
            }}
        >
            <input type="hidden" name="id" value={id} />
            <DeleteSubmitButton name={name} />
        </form>
    )
}

export default DeleteCategoryButton
