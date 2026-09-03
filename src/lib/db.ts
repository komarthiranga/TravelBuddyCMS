import postgres from 'postgres'

import { drizzle } from 'drizzle-orm/postgres-js'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
}

const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1')

const globalForDb = globalThis as unknown as {
    sql: ReturnType<typeof postgres> | undefined
}

export const sql =
    globalForDb.sql ??
    postgres(connectionString, {
        ssl: isLocal ? false : 'require',
        max: isLocal ? 10 : 1,
        prepare: isLocal,
    })

if (process.env.NODE_ENV !== 'production') {
    globalForDb.sql = sql
}

export const db = drizzle(sql)
