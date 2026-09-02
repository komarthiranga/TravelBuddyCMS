export const CATEGORY_PAGE_SIZE = 5
export const CATEGORY_PAGE_SIZES = [5, 10, 25, 50] as const

export function parseCategoryPage(value: string | string[] | undefined) {
    const raw = Array.isArray(value) ? value[0] : value
    const page = Number(raw ?? '1')

    if (!Number.isFinite(page) || page < 1) {
        return 1
    }

    return Math.floor(page)
}

export function parseCategoryPageSize(value: string | string[] | undefined) {
    const raw = Array.isArray(value) ? value[0] : value
    const pageSize = Number(raw ?? CATEGORY_PAGE_SIZE)

    if ((CATEGORY_PAGE_SIZES as readonly number[]).includes(pageSize)) {
        return pageSize
    }

    return CATEGORY_PAGE_SIZE
}

export function categoryListPath(page: number, pageSize: number) {
    const params = new URLSearchParams()

    if (page > 1) {
        params.set('page', String(page))
    }

    if (pageSize !== CATEGORY_PAGE_SIZE) {
        params.set('perPage', String(pageSize))
    }

    const query = params.toString()
    return query ? `/category?${query}` : '/category'
}
