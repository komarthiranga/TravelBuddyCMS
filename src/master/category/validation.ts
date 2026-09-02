export const CATEGORY_LIMITS = {
    name: 150,
    type: 100,
    code: 100,
} as const

export type CategoryInput = {
    name: string
    type: string
    code: string
}

export type CategoryFieldErrors = {
    name?: string
    type?: string
    code?: string
}

const CODE_PATTERN = /^[A-Z0-9_]+$/

export function normalizeCategoryInput(input: CategoryInput) {
    return {
        name: input.name.trim(),
        type: input.type.trim(),
        code: input.code.trim().toUpperCase().replace(/\s+/g, '_'),
    }
}

export function validateCategoryInput(input: CategoryInput) {
    const values = normalizeCategoryInput(input)
    const errors: CategoryFieldErrors = {}

    if (!values.name) {
        errors.name = 'Name cannot be empty.'
    } else if (values.name.length > CATEGORY_LIMITS.name) {
        errors.name = `Name can be at most ${CATEGORY_LIMITS.name} characters.`
    }

    if (!values.type) {
        errors.type = 'Type cannot be empty.'
    } else if (values.type.length > CATEGORY_LIMITS.type) {
        errors.type = `Type can be at most ${CATEGORY_LIMITS.type} characters.`
    }

    if (!values.code) {
        errors.code = 'Code cannot be empty.'
    } else if (values.code.length > CATEGORY_LIMITS.code) {
        errors.code = `Code can be at most ${CATEGORY_LIMITS.code} characters.`
    } else if (!CODE_PATTERN.test(values.code)) {
        errors.code = 'Code can only contain letters, numbers, and underscores.'
    }

    return {
        values,
        errors,
        ok: Object.keys(errors).length === 0,
    }
}
