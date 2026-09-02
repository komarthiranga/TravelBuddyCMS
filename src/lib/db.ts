import postgres from 'postgres';

import { drizzle } from 'drizzle-orm/postgres-js';

const connectionString = process.env.DATABASE_URL;

if(!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

const globalForDb = globalThis as unknown as {
    sql: ReturnType<typeof postgres> | undefined;
};

export const sql = globalForDb.sql ?? (globalForDb.sql = postgres(connectionString));

if(process.env.NODE_ENV !== 'production') globalForDb.sql = sql;

export const db = drizzle(sql);