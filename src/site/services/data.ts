import 'server-only'
import { sql } from '@/lib/db'
export type LocalService = {
    id: number; name: string; category: string; area: string; address: string | null;
    phone: string | null; pincode: string | null; source_url: string;
    checked_at: string; review_due_at: string;
}
export async function getLocalServices(cityId?: number): Promise<{services:LocalService[];loadedAt:number}> {
    const services = cityId ? await sql<LocalService[]>`select id::integer,name,category,area,address,phone,pincode,source_url,
      checked_at::text,review_due_at::text from local_service
      where city_id=${cityId} and status='published'
      order by case category when 'hospitals' then 0 when 'helplines' then 1 when 'civic' then 2 else 3 end,name` : []
    return {services,loadedAt:Date.now()}
}
