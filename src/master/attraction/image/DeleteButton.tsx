'use client'

import { useFormStatus } from 'react-dom'
import { Loader2Icon, Trash2 } from 'lucide-react'

import { deleteAttractionImageAction } from '@/master/attraction/image/deleteAction'
import { Button } from '@/components/ui/button'

function DeleteSubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            variant="ghost"
            size="icon-xs"
            disabled={pending}
            aria-label={pending ? 'Deleting image' : 'Delete image'}
            title="Delete"
        >
            {pending ? <Loader2Icon className="animate-spin" /> : <Trash2 className="text-destructive" />}
        </Button>
    )
}

function DeleteAttractionImageButton({ id, label }: { id: number; label: string }) {
    return (
        <form
            action={deleteAttractionImageAction}
            onSubmit={(event) => {
                const confirmed = window.confirm(`Delete image “${label}”? This cannot be undone.`)

                if (!confirmed) {
                    event.preventDefault()
                }
            }}
        >
            <input type="hidden" name="id" value={id} />
            <DeleteSubmitButton />
        </form>
    )
}

export default DeleteAttractionImageButton
