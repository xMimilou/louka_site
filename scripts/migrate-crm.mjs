// scripts/migrate-crm.mjs
import { DatabaseSync } from 'node:sqlite'
import mysql from 'mysql2/promise'
import { randomUUID } from 'node:crypto'

const sqlite = new DatabaseSync('C:/Users/Louka/Documents/crm_perso/crm.db')

const pool = await mysql.createPool({
  host: '192.168.1.26',
  port: 3306,
  database: 'louka_site',
  user: 'dev_user',
  password: 'stock_pass',
})

// Migrate candidates
const candidates = sqlite.prepare('SELECT * FROM candidates').all()
console.log(`Migrating ${candidates.length} candidates...`)

for (const c of candidates) {
  await pool.execute(
    `INSERT IGNORE INTO candidates
     (id, name, email, phone, linkedin_url, headline, location, keyword,
      fit_grade, source, answers, notes, status, ai_score, ai_verdict, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      c.name,
      c.email ?? null,
      c.phone ?? null,
      c.linkedin_url ?? null,
      c.headline ?? null,
      c.location ?? null,
      c.keyword ?? null,
      c.fit_grade ?? null,
      c.source ?? 'manuel',
      c.answers ?? null,
      c.notes ?? null,
      c.status ?? 'recu',
      c.ai_score ?? null,
      c.ai_verdict ?? null,
      c.created_at ?? new Date().toISOString().slice(0, 19).replace('T', ' '),
    ]
  )
}
console.log('✅ Candidates migrated')

// Migrate closers
const closers = sqlite.prepare('SELECT * FROM closers').all()
for (const cl of closers) {
  await pool.execute(
    'INSERT IGNORE INTO closers (id, name, email, created_at) VALUES (?, ?, ?, ?)',
    [randomUUID(), cl.name, cl.email ?? null, cl.created_at ?? null]
  )
}
console.log(`✅ ${closers.length} closer(s) migrated`)

// Migrate tweets
const tweets = sqlite.prepare('SELECT * FROM tweets').all()
for (const t of tweets) {
  await pool.execute(
    'INSERT INTO tweets (id, content, scheduled_at, published, likes, impressions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [randomUUID(), t.content, t.scheduled_at ?? null, t.published ?? 0, t.likes ?? 0, t.impressions ?? 0, t.created_at ?? null]
  )
}
console.log(`✅ ${tweets.length} tweet(s) migrated`)

// Migrate logs
const logs = sqlite.prepare('SELECT * FROM logs').all()
for (const l of logs) {
  await pool.execute(
    'INSERT INTO logs (id, level, message, created_at) VALUES (?, ?, ?, ?)',
    [randomUUID(), l.level ?? 'info', l.message, l.created_at ?? null]
  )
}
console.log(`✅ ${logs.length} log(s) migrated`)

await pool.end()
sqlite.close()
console.log('Migration complete.')
