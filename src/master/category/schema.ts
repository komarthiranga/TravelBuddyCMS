import {bigint, pgTable, timestamp, varchar} from 'drizzle-orm/pg-core'

export const categoryTable = pgTable('category', {

    id: bigint({mode: 'number'}).primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', {length: 150}).notNull(),
    category_type: varchar('category_type', {length: 100}).notNull(),
    code: varchar('code', {length: 100}).notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
});