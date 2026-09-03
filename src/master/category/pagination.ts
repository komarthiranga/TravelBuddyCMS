export {
    MASTER_PAGE_SIZE as CATEGORY_PAGE_SIZE,
    MASTER_PAGE_SIZES as CATEGORY_PAGE_SIZES,
    parsePage as parseCategoryPage,
    parsePageSize as parseCategoryPageSize,
} from '@/master/list-pagination'

import { masterListPath } from '@/master/list-pagination'

export function categoryListPath(page: number, pageSize: number) {
    return masterListPath('/category', page, pageSize)
}
