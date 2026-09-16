import type { LocalService } from './data'
export function filterServices(rows: LocalService[], category: string, area: string, query: string) {
    const term=query.trim().toLocaleLowerCase()
    return rows.filter(row => (!category || row.category===category)
        && (area==='all' || row.area==='city' || row.area==='national')
        && `${row.name} ${row.address ?? ''} ${row.pincode ?? ''}`.toLocaleLowerCase().includes(term))
}
export function servicePhone(row: Pick<LocalService,'phone'|'review_due_at'>, now=Date.now()) {
    return row.phone && /^\+?\d{3,15}$/.test(row.phone) && Date.parse(row.review_due_at)>now ? `tel:${row.phone}` : null
}
