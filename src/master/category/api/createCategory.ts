
import { requireCmsAdmin } from '@/lib/cms-auth'
import { db } from "@/lib/db";
import { categoryTable } from "../schema";

export async function createCategory(category: {name: string, category_type: string, code: string}) {
    await requireCmsAdmin()
    return db.insert(categoryTable).values(category);
}