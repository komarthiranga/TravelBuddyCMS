import { db } from "@/lib/db";
import { categoryTable } from "../schema";

export async function createCategory(category: {name: string, category_type: string, code: string}) {
    return db.insert(categoryTable).values(category);
}