import { bigint, boolean, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { attractionTable } from '@/master/attraction/schema'

export const attractionImageTable = pgTable('attraction_image', {
    id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    attraction_id: bigint('attraction_id', { mode: 'number' })
        .notNull()
        .references(() => attractionTable.id, { onDelete: 'cascade' }),
    image_url: text('image_url').notNull(),
    public_id: varchar('public_id', { length: 300 }).notNull(),
    alt_text: varchar('alt_text', { length: 300 }),
    display_order: integer('display_order').notNull().default(0),
    is_primary: boolean('is_primary').notNull().default(false),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
