import postgres from 'postgres'
import { readFile } from 'node:fs/promises'
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
const url = process.env.DATABASE_URL
const sql = postgres(url, { ssl: /localhost|127\.0\.0\.1/.test(url) ? false : 'require', max: 1 })
try {
    await sql.begin(async tx => { await tx.unsafe(await readFile(new URL('./schema.sql', import.meta.url), 'utf8')) })
    console.log('Traveller and saved/liked place tables are ready. Master tables were not modified.')
} finally { await sql.end() }
