import { sql } from 'drizzle-orm'
import {
    bigint,
    boolean,
    numeric,
    pgTable,
    text,
    time,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core'

import { categoryTable } from '@/master/category/schema'
import { cityTable } from '@/master/city/schema'

export const attractionTable = pgTable('attraction', {
    id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    short_name: varchar('short_name', { length: 150 }).notNull(),
    full_name: varchar('full_name', { length: 300 }).notNull(),
    slug: varchar('slug', { length: 350 }).notNull(),
    address: text('address').notNull(),
    city_id: bigint('city_id', { mode: 'number' })
        .notNull()
        .references(() => cityTable.id),
    category_id: bigint('category_id', { mode: 'number' })
        .notNull()
        .references(() => categoryTable.id),
    latitude: numeric('latitude', { precision: 9, scale: 6, mode: 'string' }),
    longitude: numeric('longitude', { precision: 9, scale: 6, mode: 'string' }),
    entry_fee: numeric('entry_fee', { precision: 10, scale: 2, mode: 'string' }).notNull().default('0'),
    currency_code: varchar('currency_code', { length: 3 }).notNull().default('INR'),
    opening_time: time('opening_time'),
    closing_time: time('closing_time'),
    best_time_to_visit: varchar('best_time_to_visit', { length: 300 }),
    travel_modes: text('travel_modes').array().notNull().default(sql`'{}'`),
    short_description: varchar('short_description', { length: 500 }).notNull(),
    full_description: text('full_description'),
    instructions: text('instructions'),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
