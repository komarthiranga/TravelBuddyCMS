export function isUniqueViolation(error: unknown) {
    let current: unknown = error

    for (let i = 0; i < 4; i += 1) {
        if (
            typeof current === 'object' &&
            current !== null &&
            'code' in current &&
            current.code === '23505'
        ) {
            return true
        }

        if (typeof current === 'object' && current !== null && 'cause' in current) {
            current = current.cause
            continue
        }

        break
    }

    return false
}

export function parseCategoryId(value: string | string[] | undefined) {
    const raw = Array.isArray(value) ? value[0] : value
    const id = Number(raw)

    if (!Number.isInteger(id) || id < 1) {
        return null
    }

    return id
}
