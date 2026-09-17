import 'server-only'
import { sql } from '@/lib/db'
export type Stay = {
 id: number; slug: string; name: string; kind: 'hotel' | 'oyo' | 'hostel' | 'room';
 area: string; address: string; phone: string; latitude: number; longitude: number;
 summary: string; source_url: string; source_name: string; coordinate_source_url: string;
 coordinate_note: string; checked_at: string; review_due_at: string;
}
export async function getStays(cityId?: number): Promise<Stay[]> {
 if (!cityId) return []
 return sql<Stay[]>`select id::integer,slug,name,kind,area,address,phone,latitude,longitude,
 summary,source_url,source_name,coordinate_source_url,coordinate_note,checked_at::text,review_due_at::text
 from stay where city_id=${cityId} and status='published' order by name`
}
