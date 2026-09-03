import { bigint, boolean, numeric, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

export const cityTable = pgTable('city', {
    id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 150 }).notNull(),
    code: varchar('code', { length: 100 }).notNull(),
    state: varchar('state', { length: 150 }).notNull(),
    country: varchar('country', { length: 150 }).notNull(),
    latitude: numeric('latitude', { precision: 9, scale: 6, mode: 'string' }),
    longitude: numeric('longitude', { precision: 9, scale: 6, mode: 'string' }),
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
