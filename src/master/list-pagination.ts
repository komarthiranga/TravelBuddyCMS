export const MASTER_PAGE_SIZE = 5
export const MASTER_PAGE_SIZES = [5, 10, 25, 50] as const

export function parsePage(value: string | string[] | undefined) {
    const raw = Array.isArray(value) ? value[0] : value
    const page = Number(raw ?? '1')

    if (!Number.isFinite(page) || page < 1) {
        return 1
    }

    return Math.floor(page)
}

export function parsePageSize(value: string | string[] | undefined) {
    const raw = Array.isArray(value) ? value[0] : value
    const pageSize = Number(raw ?? MASTER_PAGE_SIZE)

    if ((MASTER_PAGE_SIZES as readonly number[]).includes(pageSize)) {
        return pageSize
    }

    return MASTER_PAGE_SIZE
}

export function masterListPath(basePath: string, page: number, pageSize: number) {
    const params = new URLSearchParams()

    if (page > 1) {
        params.set('page', String(page))
    }

    if (pageSize !== MASTER_PAGE_SIZE) {
        params.set('perPage', String(pageSize))
    }

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
}
