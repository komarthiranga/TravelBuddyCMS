export function parseAttractionId(value: string | string[] | undefined) {
    const raw = Array.isArray(value) ? value[0] : value
    const id = Number(raw)

    if (!Number.isInteger(id) || id < 1) {
        return null
    }

    return id
}
