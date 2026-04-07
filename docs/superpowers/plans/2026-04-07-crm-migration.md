# CRM Migration Plan — crm_perso → loukamillon.com/admin

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the standalone crm_perso SQLite CRM (130 candidates, pipeline Kanban, payments, tweets) into the existing loukamillon.com Next.js 15 admin, backed by MySQL on 192.168.1.26.

**Architecture:** New MySQL tables (candidates, closers, payments, tasks, tweets, logs) mirror the crm_perso SQLite schema. Client admin pages call authenticated REST API routes (`/api/admin/*`) that use the existing `pool` from `lib/db.ts`. Data is migrated via a one-time Node.js script. No new npm packages required — native HTML5 drag for Kanban.

**Tech Stack:** Next.js 15 App Router, TypeScript, MySQL2, `lib/db.ts` pool, `lib/api-auth.ts` requireAuth, `lib/db-parse.ts` helpers.

**Existing patterns to follow:**
- API routes: `app/api/admin/articles/route.ts` (GET list + POST create)
- API routes: `app/api/admin/articles/[id]/route.ts` (GET + PUT + DELETE)
- Auth: `await requireAuth()` from `lib/api-auth.ts` — returns null if unauthenticated
- Parse: `parseArticle()` from `lib/db-parse.ts` — handles JSON fields + booleans from MySQL
- Admin pages: client components, `fetch('/api/admin/...')`, toast notifications

---

## File Structure

**New files — API routes:**
- `app/api/admin/candidates/route.ts` — GET list (filters: status, fit_grade, search), POST create
- `app/api/admin/candidates/[id]/route.ts` — GET one, PUT update, DELETE
- `app/api/admin/candidates/[id]/status/route.ts` — PATCH status + auto-actions (payment on gagne)
- `app/api/admin/closers/route.ts` — GET list, POST create
- `app/api/admin/closers/[id]/route.ts` — DELETE
- `app/api/admin/payments/route.ts` — GET list
- `app/api/admin/payments/[id]/route.ts` — PUT (mark paid)
- `app/api/admin/tasks/route.ts` — GET list, POST create
- `app/api/admin/tasks/[id]/route.ts` — PUT (toggle done), DELETE
- `app/api/admin/tweets/route.ts` — GET list, POST create
- `app/api/admin/tweets/[id]/route.ts` — PUT (publish/update), DELETE
- `app/api/admin/logs/route.ts` — GET last 100
- `app/api/admin/dashboard/route.ts` — GET KPIs object

**New files — Admin pages:**
- `app/admin/page.tsx` — Dashboard global (replaces current redirect)
- `app/admin/candidatures/page.tsx` — Prospect list with filters + AI score + notes
- `app/admin/crm/page.tsx` — Kanban pipeline (native drag-and-drop)
- `app/admin/closers/page.tsx` — Team members + open tasks
- `app/admin/paiements/page.tsx` — Payment list + mark paid
- `app/admin/tweets/page.tsx` — Tweet calendar (draft → scheduled → published)

**Modified files:**
- `lib/db-parse.ts` — add `parseCandidate`, `parseCloser`, `parsePayment`, `parseTask`, `parseTweet`, `parseLog`
- `components/admin/Sidebar.tsx` — add CRM section with all new nav items
- `app/admin/settings/page.tsx` — already updated (Telegram + Anthropic sections added)

**New file — Migration script:**
- `scripts/migrate-crm.mjs` — one-time SQLite → MySQL migration

---

### Task 1: MySQL Tables

**Files:**
- Run SQL on server via SSH

- [ ] **Step 1: Create all CRM tables**

```bash
ssh louka@192.168.1.26 "docker exec -i mysql mysql -udev_user -pstock_pass louka_site" << 'SQL'
CREATE TABLE IF NOT EXISTS candidates (
  id       CHAR(36)     NOT NULL DEFAULT (UUID()),
  name     VARCHAR(255) NOT NULL,
  email    VARCHAR(255),
  phone    VARCHAR(100),
  linkedin_url VARCHAR(500) UNIQUE,
  headline VARCHAR(500),
  location VARCHAR(255),
  keyword  VARCHAR(255),
  fit_grade ENUM('A','B','C','D'),
  source   VARCHAR(100)  DEFAULT 'manuel',
  answers  TEXT,
  notes    TEXT,
  status   ENUM('recu','contacte','qualifie','rdv','gagne','perdu') DEFAULT 'recu',
  ai_score INT,
  ai_verdict VARCHAR(255),
  closer_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS closers (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS payments (
  id           CHAR(36) NOT NULL DEFAULT (UUID()),
  candidate_id CHAR(36),
  amount       INT DEFAULT 0,
  currency     VARCHAR(10) DEFAULT 'EUR',
  status       ENUM('pending','paid') DEFAULT 'pending',
  stripe_id    VARCHAR(255),
  paid_at      DATETIME,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id           CHAR(36) NOT NULL DEFAULT (UUID()),
  closer_id    CHAR(36),
  candidate_id CHAR(36),
  title        TEXT NOT NULL,
  done         TINYINT(1) DEFAULT 0,
  due_date     DATE,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS tweets (
  id           CHAR(36) NOT NULL DEFAULT (UUID()),
  content      TEXT NOT NULL,
  scheduled_at DATETIME,
  published    TINYINT(1) DEFAULT 0,
  likes        INT DEFAULT 0,
  impressions  INT DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS logs (
  id         CHAR(36) NOT NULL DEFAULT (UUID()),
  level      VARCHAR(20) DEFAULT 'info',
  message    TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
SQL
```

- [ ] **Step 2: Verify tables exist**

```bash
ssh louka@192.168.1.26 "docker exec -i mysql mysql -udev_user -pstock_pass louka_site -e 'SHOW TABLES;'" 2>&1
```

Expected output includes: `candidates`, `closers`, `payments`, `tasks`, `tweets`, `logs`

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "feat(crm): add MySQL tables candidates/closers/payments/tasks/tweets/logs"
```

---

### Task 2: Migrate SQLite Data → MySQL

**Files:**
- Create: `scripts/migrate-crm.mjs`

- [ ] **Step 1: Create migration script**

```js
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
```

- [ ] **Step 2: Run migration**

```bash
cd C:\Users\Louka\Documents\agence_automatisation\personnal_site
node scripts/migrate-crm.mjs
```

Expected output:
```
Migrating 130 candidates...
✅ Candidates migrated
✅ 1 closer(s) migrated
✅ 2 tweet(s) migrated
✅ 4 log(s) migrated
Migration complete.
```

- [ ] **Step 3: Verify on server**

```bash
ssh louka@192.168.1.26 "docker exec -i mysql mysql -udev_user -pstock_pass louka_site -e 'SELECT COUNT(*) FROM candidates; SELECT COUNT(*) FROM closers;'" 2>&1
```

Expected: `130` candidates, `1` closer.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-crm.mjs && git commit -m "feat(crm): one-time SQLite→MySQL migration script"
```

---

### Task 3: db-parse Helpers

**Files:**
- Modify: `lib/db-parse.ts`

- [ ] **Step 1: Add parse functions for all new entities**

Append to `lib/db-parse.ts`:

```typescript
import type { Article, Project, Workflow, PlatformLink } from './types'

// --- existing code above ---

export interface Candidate {
  id: string
  name: string
  email: string | null
  phone: string | null
  linkedin_url: string | null
  headline: string | null
  location: string | null
  keyword: string | null
  fit_grade: 'A' | 'B' | 'C' | 'D' | null
  source: string
  answers: string | null
  notes: string | null
  status: 'recu' | 'contacte' | 'qualifie' | 'rdv' | 'gagne' | 'perdu'
  ai_score: number | null
  ai_verdict: string | null
  closer_id: string | null
  created_at: string
}

export interface Closer {
  id: string
  name: string
  email: string | null
  created_at: string
}

export interface Payment {
  id: string
  candidate_id: string | null
  candidate_name?: string
  amount: number
  currency: string
  status: 'pending' | 'paid'
  stripe_id: string | null
  paid_at: string | null
  created_at: string
}

export interface Task {
  id: string
  closer_id: string | null
  candidate_id: string | null
  candidate_name?: string
  closer_name?: string
  title: string
  done: boolean
  due_date: string | null
  created_at: string
}

export interface Tweet {
  id: string
  content: string
  scheduled_at: string | null
  published: boolean
  likes: number
  impressions: number
  created_at: string
}

export interface Log {
  id: string
  level: string
  message: string
  created_at: string
}

export function parseCandidate(row: Record<string, unknown>): Candidate {
  return {
    ...row,
    ai_score: row.ai_score !== null && row.ai_score !== undefined ? Number(row.ai_score) : null,
    created_at: String(row.created_at),
  } as Candidate
}

export function parseCloser(row: Record<string, unknown>): Closer {
  return { ...row, created_at: String(row.created_at) } as Closer
}

export function parsePayment(row: Record<string, unknown>): Payment {
  return {
    ...row,
    amount: Number(row.amount ?? 0),
    paid_at: row.paid_at ? String(row.paid_at) : null,
    created_at: String(row.created_at),
  } as Payment
}

export function parseTask(row: Record<string, unknown>): Task {
  return {
    ...row,
    done: parseBool(row.done),
    created_at: String(row.created_at),
  } as Task
}

export function parseTweet(row: Record<string, unknown>): Tweet {
  return {
    ...row,
    published: parseBool(row.published),
    likes: Number(row.likes ?? 0),
    impressions: Number(row.impressions ?? 0),
    scheduled_at: row.scheduled_at ? String(row.scheduled_at) : null,
    created_at: String(row.created_at),
  } as Tweet
}

export function parseLog(row: Record<string, unknown>): Log {
  return { ...row, created_at: String(row.created_at) } as Log
}
```

**Important:** The `parseBool` function is already defined earlier in `lib/db-parse.ts` — do not redefine it. Just append the new interfaces and functions after the existing code.

- [ ] **Step 2: Commit**

```bash
git add lib/db-parse.ts && git commit -m "feat(crm): db-parse helpers for candidates/closers/payments/tasks/tweets/logs"
```

---

### Task 4: Candidates API Routes

**Files:**
- Create: `app/api/admin/candidates/route.ts`
- Create: `app/api/admin/candidates/[id]/route.ts`
- Create: `app/api/admin/candidates/[id]/status/route.ts`

- [ ] **Step 1: Create `app/api/admin/candidates/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseCandidate } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const fit = searchParams.get('fit')
  const q = searchParams.get('q')

  let query = 'SELECT * FROM candidates WHERE 1=1'
  const params: unknown[] = []

  if (status && status !== 'all') {
    query += ' AND status = ?'
    params.push(status)
  }
  if (fit && fit !== 'all') {
    query += ' AND fit_grade = ?'
    params.push(fit)
  }
  if (q) {
    query += ' AND (name LIKE ? OR headline LIKE ? OR notes LIKE ? OR keyword LIKE ?)'
    const like = `%${q}%`
    params.push(like, like, like, like)
  }

  query += ' ORDER BY created_at DESC LIMIT 300'

  const [rows] = await pool.execute(query, params) as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseCandidate))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()

  const body = await req.json()
  const id = crypto.randomUUID()
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

  await pool.execute(
    `INSERT INTO candidates (id, name, email, phone, linkedin_url, headline, location, keyword, fit_grade, source, notes, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      body.name,
      body.email ?? null,
      body.phone ?? null,
      body.linkedin_url ?? null,
      body.headline ?? null,
      body.location ?? null,
      body.keyword ?? null,
      body.fit_grade ?? null,
      body.source ?? 'manuel',
      body.notes ?? null,
      body.status ?? 'recu',
      now,
    ]
  )

  const [rows] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseCandidate(rows[0]), { status: 201 })
}
```

- [ ] **Step 2: Create `app/api/admin/candidates/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseCandidate } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const [rows] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(parseCandidate(rows[0]))
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const body = await req.json()

  await pool.execute(
    `UPDATE candidates SET
      name = ?, email = ?, phone = ?, linkedin_url = ?, headline = ?,
      location = ?, keyword = ?, fit_grade = ?, source = ?,
      notes = ?, status = ?, ai_score = ?, ai_verdict = ?, closer_id = ?
     WHERE id = ?`,
    [
      body.name,
      body.email ?? null,
      body.phone ?? null,
      body.linkedin_url ?? null,
      body.headline ?? null,
      body.location ?? null,
      body.keyword ?? null,
      body.fit_grade ?? null,
      body.source ?? 'manuel',
      body.notes ?? null,
      body.status,
      body.ai_score ?? null,
      body.ai_verdict ?? null,
      body.closer_id ?? null,
      id,
    ]
  )

  const [rows] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseCandidate(rows[0]))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM candidates WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create `app/api/admin/candidates/[id]/status/route.ts`**

This route handles status change + auto-actions (create payment when status = 'gagne').

```typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseCandidate } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const { status } = await req.json()

  await pool.execute('UPDATE candidates SET status = ? WHERE id = ?', [status, id])

  // Auto-action: create pending payment when moved to 'gagne'
  if (status === 'gagne') {
    const existing = await pool.execute(
      'SELECT id FROM payments WHERE candidate_id = ?',
      [id]
    ) as [Record<string, unknown>[], unknown]
    if ((existing[0] as unknown[]).length === 0) {
      await pool.execute(
        'INSERT INTO payments (id, candidate_id, amount, currency, status) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), id, 149700, 'EUR', 'pending']
      )
    }
  }

  // Log the action
  const [rows] = await pool.execute('SELECT name FROM candidates WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  const name = rows[0]?.name ?? id
  await pool.execute(
    'INSERT INTO logs (id, level, message) VALUES (?, ?, ?)',
    [crypto.randomUUID(), 'info', `Statut prospect "${name}" → ${status}`]
  )

  const [updated] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseCandidate(updated[0]))
}
```

**Note:** Amount `149700` = 1497 EUR in cents (your offer price).

- [ ] **Step 4: Verify — test with curl**

```bash
# Login first
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@loukamillon.com","password":"admin2024!"}' \
  -c /tmp/c.txt

# List candidates
curl -s http://localhost:3000/api/admin/candidates?fit=A -b /tmp/c.txt | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d).length,'A-fit candidates')"
```

Expected: `N A-fit candidates` (should be > 0 after migration)

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/candidates/ && git commit -m "feat(crm): candidates API routes — CRUD + status auto-actions"
```

---

### Task 5: Closers + Payments + Tasks + Tweets + Logs API Routes

**Files:**
- Create: `app/api/admin/closers/route.ts`
- Create: `app/api/admin/closers/[id]/route.ts`
- Create: `app/api/admin/payments/route.ts`
- Create: `app/api/admin/payments/[id]/route.ts`
- Create: `app/api/admin/tasks/route.ts`
- Create: `app/api/admin/tasks/[id]/route.ts`
- Create: `app/api/admin/tweets/route.ts`
- Create: `app/api/admin/tweets/[id]/route.ts`
- Create: `app/api/admin/logs/route.ts`

- [ ] **Step 1: Create `app/api/admin/closers/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseCloser } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute('SELECT * FROM closers ORDER BY created_at') as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseCloser))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const { name, email } = await req.json()
  const id = crypto.randomUUID()
  await pool.execute('INSERT INTO closers (id, name, email) VALUES (?, ?, ?)', [id, name, email ?? null])
  const [rows] = await pool.execute('SELECT * FROM closers WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseCloser(rows[0]), { status: 201 })
}
```

- [ ] **Step 2: Create `app/api/admin/closers/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM closers WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create `app/api/admin/payments/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parsePayment } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute(
    `SELECT p.*, c.name AS candidate_name
     FROM payments p
     LEFT JOIN candidates c ON c.id = p.candidate_id
     ORDER BY p.created_at DESC`
  ) as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parsePayment))
}
```

- [ ] **Step 4: Create `app/api/admin/payments/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parsePayment } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  await pool.execute(
    "UPDATE payments SET status = 'paid', paid_at = ? WHERE id = ?",
    [now, id]
  )
  await pool.execute(
    'INSERT INTO logs (id, level, message) VALUES (?, ?, ?)',
    [crypto.randomUUID(), 'info', `Paiement ${id} marqué comme payé`]
  )
  const [rows] = await pool.execute(
    'SELECT p.*, c.name AS candidate_name FROM payments p LEFT JOIN candidates c ON c.id = p.candidate_id WHERE p.id = ?',
    [id]
  ) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parsePayment(rows[0]))
}
```

- [ ] **Step 5: Create `app/api/admin/tasks/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseTask } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute(
    `SELECT t.*, ca.name AS candidate_name, cl.name AS closer_name
     FROM tasks t
     LEFT JOIN candidates ca ON ca.id = t.candidate_id
     LEFT JOIN closers cl ON cl.id = t.closer_id
     WHERE t.done = 0
     ORDER BY t.due_date ASC, t.created_at ASC`
  ) as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseTask))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const body = await req.json()
  const id = crypto.randomUUID()
  await pool.execute(
    'INSERT INTO tasks (id, closer_id, candidate_id, title, due_date) VALUES (?, ?, ?, ?, ?)',
    [id, body.closer_id ?? null, body.candidate_id ?? null, body.title, body.due_date ?? null]
  )
  const [rows] = await pool.execute(
    'SELECT t.*, ca.name AS candidate_name, cl.name AS closer_name FROM tasks t LEFT JOIN candidates ca ON ca.id = t.candidate_id LEFT JOIN closers cl ON cl.id = t.closer_id WHERE t.id = ?',
    [id]
  ) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseTask(rows[0]), { status: 201 })
}
```

- [ ] **Step 6: Create `app/api/admin/tasks/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const { done } = await req.json()
  await pool.execute('UPDATE tasks SET done = ? WHERE id = ?', [done ? 1 : 0, id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM tasks WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 7: Create `app/api/admin/tweets/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseTweet } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute('SELECT * FROM tweets ORDER BY created_at DESC LIMIT 100') as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseTweet))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const body = await req.json()
  const id = crypto.randomUUID()
  const scheduled = body.scheduled_at
    ? new Date(body.scheduled_at).toISOString().replace('T', ' ').slice(0, 19)
    : null
  await pool.execute(
    'INSERT INTO tweets (id, content, scheduled_at, published) VALUES (?, ?, ?, ?)',
    [id, body.content, scheduled, 0]
  )
  const [rows] = await pool.execute('SELECT * FROM tweets WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseTweet(rows[0]), { status: 201 })
}
```

- [ ] **Step 8: Create `app/api/admin/tweets/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseTweet } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const body = await req.json()

  if (body.published !== undefined) {
    await pool.execute('UPDATE tweets SET published = ? WHERE id = ?', [body.published ? 1 : 0, id])
  } else {
    const scheduled = body.scheduled_at
      ? new Date(body.scheduled_at).toISOString().replace('T', ' ').slice(0, 19)
      : null
    await pool.execute(
      'UPDATE tweets SET content = ?, scheduled_at = ? WHERE id = ?',
      [body.content, scheduled, id]
    )
  }

  const [rows] = await pool.execute('SELECT * FROM tweets WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseTweet(rows[0]))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM tweets WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 9: Create `app/api/admin/logs/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseLog } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute(
    'SELECT * FROM logs ORDER BY created_at DESC LIMIT 100'
  ) as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseLog))
}
```

- [ ] **Step 10: Commit**

```bash
git add app/api/admin/closers/ app/api/admin/payments/ app/api/admin/tasks/ app/api/admin/tweets/ app/api/admin/logs/
git commit -m "feat(crm): API routes for closers/payments/tasks/tweets/logs"
```

---

### Task 6: Dashboard API Route

**Files:**
- Create: `app/api/admin/dashboard/route.ts`

- [ ] **Step 1: Create dashboard KPIs route**

```typescript
import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()

  const [[candidatesRow]] = await pool.execute('SELECT COUNT(*) AS n FROM candidates') as [Record<string, unknown>[], unknown]
  const [[fitARow]] = await pool.execute("SELECT COUNT(*) AS n FROM candidates WHERE fit_grade = 'A'") as [Record<string, unknown>[], unknown]
  const [[fitBRow]] = await pool.execute("SELECT COUNT(*) AS n FROM candidates WHERE fit_grade = 'B'") as [Record<string, unknown>[], unknown]
  const [[wonRow]] = await pool.execute("SELECT COUNT(*) AS n FROM candidates WHERE status = 'gagne'") as [Record<string, unknown>[], unknown]
  const [[revenueRow]] = await pool.execute("SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status = 'paid'") as [Record<string, unknown>[], unknown]
  const [[articlesRow]] = await pool.execute("SELECT COUNT(*) AS n FROM articles WHERE status = 'published'") as [Record<string, unknown>[], unknown]
  const [[tweetsRow]] = await pool.execute('SELECT COUNT(*) AS n FROM tweets WHERE published = 1') as [Record<string, unknown>[], unknown]
  const [[pendingRow]] = await pool.execute("SELECT COUNT(*) AS n FROM payments WHERE status = 'pending'") as [Record<string, unknown>[], unknown]

  // Recent candidates (last 5)
  const [recentCandidates] = await pool.execute(
    'SELECT id, name, fit_grade, status, created_at FROM candidates ORDER BY created_at DESC LIMIT 5'
  ) as [Record<string, unknown>[], unknown]

  // Pipeline funnel counts
  const [funnel] = await pool.execute(
    'SELECT status, COUNT(*) AS n FROM candidates GROUP BY status'
  ) as [Record<string, unknown>[], unknown]

  return NextResponse.json({
    candidates: Number((candidatesRow as Record<string, unknown>).n),
    fit_a: Number((fitARow as Record<string, unknown>).n),
    fit_b: Number((fitBRow as Record<string, unknown>).n),
    won: Number((wonRow as Record<string, unknown>).n),
    revenue_cents: Number((revenueRow as Record<string, unknown>).total),
    articles_published: Number((articlesRow as Record<string, unknown>).n),
    tweets_published: Number((tweetsRow as Record<string, unknown>).n),
    payments_pending: Number((pendingRow as Record<string, unknown>).n),
    recent_candidates: recentCandidates,
    funnel: (funnel as Record<string, unknown>[]).reduce((acc, r) => {
      acc[r.status as string] = Number(r.n)
      return acc
    }, {} as Record<string, number>),
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/dashboard/route.ts && git commit -m "feat(crm): dashboard KPIs API route"
```

---

### Task 7: Sidebar Update

**Files:**
- Modify: `components/admin/Sidebar.tsx`

- [ ] **Step 1: Replace Sidebar with CRM-extended version**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Kanban, FileText, FolderOpen,
  Link2, HardDrive, Settings, Zap, CreditCard, Twitter, UserCheck, FileStack
} from 'lucide-react'

const crmItems = [
  { href: '/admin/candidatures', icon: Users, label: 'Prospects' },
  { href: '/admin/crm', icon: Kanban, label: 'Pipeline CRM' },
  { href: '/admin/closers', icon: UserCheck, label: 'Closers & Tâches' },
  { href: '/admin/paiements', icon: CreditCard, label: 'Paiements' },
]

const contentItems = [
  { href: '/admin/articles', icon: FileText, label: 'Articles & Ressources' },
  { href: '/admin/tweets', icon: Twitter, label: 'Tweets' },
]

const siteItems = [
  { href: '/admin/projects', icon: FolderOpen, label: 'Projets' },
  { href: '/admin/workflows', icon: Zap, label: 'Workflows' },
  { href: '/admin/links', icon: Link2, label: 'Liens' },
  { href: '/admin/files', icon: HardDrive, label: 'Fichiers' },
  { href: '/admin/settings', icon: Settings, label: 'Paramètres' },
]

function NavItem({ href, icon: Icon, label, pathname }: { href: string; icon: React.ElementType; label: string; pathname: string }) {
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-dm transition-all duration-200 ${
        isActive
          ? 'bg-accent/15 text-accent font-medium'
          : 'text-admin-muted hover:text-admin-text hover:bg-admin-surface'
      }`}
    >
      <Icon size={15} className="flex-shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1 font-mono text-[10px] text-admin-muted uppercase tracking-[0.12em]">
      {children}
    </p>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col border-r overflow-y-auto" style={{ background: '#161B27', borderColor: '#2D3748' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b flex-shrink-0" style={{ borderColor: '#2D3748' }}>
        <Link href="/admin" className="font-mono text-accent text-base font-medium tracking-wider">
          [L.M]
        </Link>
        <p className="font-dm text-[11px] text-admin-muted mt-0.5">Admin Panel</p>
      </div>

      {/* Dashboard link */}
      <div className="px-3 pt-3">
        <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" pathname={pathname} />
      </div>

      {/* CRM */}
      <nav className="px-3 pb-2" aria-label="CRM">
        <SectionLabel>CRM</SectionLabel>
        {crmItems.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>

      {/* Contenu */}
      <nav className="px-3 pb-2" aria-label="Contenu">
        <SectionLabel>Contenu</SectionLabel>
        {contentItems.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>

      {/* Site */}
      <nav className="px-3 pb-4" aria-label="Site">
        <SectionLabel>Site</SectionLabel>
        {siteItems.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-6 py-4 border-t flex-shrink-0" style={{ borderColor: '#2D3748' }}>
        <Link href="/" target="_blank" className="font-dm text-xs text-admin-muted hover:text-accent transition-colors flex items-center gap-1.5">
          <span>Voir le site</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/Sidebar.tsx && git commit -m "feat(crm): sidebar — CRM/Contenu/Site sections"
```

---

### Task 8: Dashboard Global Page

**Files:**
- Modify: `app/admin/page.tsx` (replaces the current `redirect('/admin/articles')`)

- [ ] **Step 1: Create dashboard page**

```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, TrendingUp, CreditCard, FileText } from 'lucide-react'

interface DashboardData {
  candidates: number
  fit_a: number
  fit_b: number
  won: number
  revenue_cents: number
  articles_published: number
  tweets_published: number
  payments_pending: number
  recent_candidates: { id: string; name: string; fit_grade: string; status: string; created_at: string }[]
  funnel: Record<string, number>
}

const OBJECTIF_CENTS = 200000 // 2000€

const funnelLabels: Record<string, string> = {
  recu: '📥 Reçu',
  contacte: '✉️ Contacté',
  qualifie: '✅ Qualifié',
  rdv: '📞 RDV',
  gagne: '🏆 Gagné',
  perdu: '❌ Perdu',
}

const funnelOrder = ['recu', 'contacte', 'qualifie', 'rdv', 'gagne', 'perdu']

const fitColors: Record<string, string> = {
  A: 'text-success bg-success/10 border-success/30',
  B: 'text-accent bg-accent/10 border-accent/20',
  C: 'text-warning bg-warning/10 border-warning/30',
  D: 'text-admin-muted bg-admin-surface border-admin-border',
}

function formatEuros(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const progressPct = Math.min(100, Math.round((data.revenue_cents / OBJECTIF_CENTS) * 100))

  const kpis = [
    { label: 'Prospects total', value: data.candidates, sub: `${data.fit_a} fit A · ${data.fit_b} fit B`, icon: Users, href: '/admin/candidatures' },
    { label: 'Deals gagnés', value: data.won, sub: `${data.payments_pending} paiement${data.payments_pending !== 1 ? 's' : ''} en attente`, icon: TrendingUp, href: '/admin/paiements' },
    { label: 'CA encaissé', value: formatEuros(data.revenue_cents), sub: `Objectif : 2 000 €/mois`, icon: CreditCard, href: '/admin/paiements' },
    { label: 'Articles publiés', value: data.articles_published, sub: `${data.tweets_published} tweet${data.tweets_published !== 1 ? 's' : ''} publiés`, icon: FileText, href: '/admin/articles' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-syne font-bold text-admin-text text-2xl">Dashboard</h1>
        <p className="font-dm text-admin-muted text-sm mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Objectif tracker */}
      <div className="bg-admin-surface border border-admin-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono text-xs text-admin-muted uppercase tracking-wider mb-1">Objectif avril</p>
            <p className="font-syne font-bold text-admin-text text-lg">{formatEuros(data.revenue_cents)} / 2 000 €</p>
          </div>
          <span className="font-mono text-2xl font-bold text-accent">{progressPct}%</span>
        </div>
        <div className="w-full bg-admin-bg rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="bg-admin-surface border border-admin-border rounded-xl p-5 hover:border-accent transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="font-dm text-xs text-admin-muted">{kpi.label}</p>
                <Icon size={14} className="text-admin-muted group-hover:text-accent transition-colors" aria-hidden="true" />
              </div>
              <p className="font-syne font-bold text-admin-text text-2xl mb-1">{kpi.value}</p>
              <p className="font-mono text-[10px] text-admin-muted">{kpi.sub}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-admin-surface border border-admin-border rounded-xl p-5">
          <h2 className="font-syne font-bold text-admin-text text-sm mb-4">Pipeline</h2>
          <div className="space-y-2">
            {funnelOrder.map((s) => {
              const n = data.funnel[s] ?? 0
              const max = Math.max(1, ...Object.values(data.funnel))
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="font-dm text-xs text-admin-muted w-28 flex-shrink-0">{funnelLabels[s]}</span>
                  <div className="flex-1 bg-admin-bg rounded-full h-1.5">
                    <div
                      className="bg-accent h-1.5 rounded-full transition-all"
                      style={{ width: `${(n / max) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-admin-muted w-6 text-right">{n}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent candidates */}
        <div className="bg-admin-surface border border-admin-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-admin-text text-sm">Derniers prospects</h2>
            <Link href="/admin/candidatures" className="font-dm text-xs text-accent hover:underline">Voir tout →</Link>
          </div>
          <div className="space-y-3">
            {data.recent_candidates.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                {c.fit_grade && (
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 ${fitColors[c.fit_grade] ?? fitColors.D}`}>
                    {c.fit_grade}
                  </span>
                )}
                <span className="font-dm text-sm text-admin-text truncate flex-1">{c.name}</span>
                <span className="font-mono text-[10px] text-admin-muted flex-shrink-0">{formatDate(c.created_at)}</span>
              </div>
            ))}
            {data.recent_candidates.length === 0 && (
              <p className="font-dm text-sm text-admin-muted">Aucun prospect encore.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/page.tsx && git commit -m "feat(crm): dashboard global — KPIs, objectif tracker, pipeline funnel"
```

---

### Task 9: Candidatures Page

**Files:**
- Create: `app/admin/candidatures/page.tsx`

- [ ] **Step 1: Create the candidatures list page**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, ExternalLink } from 'lucide-react'
import type { Candidate } from '@/lib/db-parse'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { toast } from '@/components/admin/Toast'

const statusLabels: Record<string, string> = {
  recu: 'Reçu', contacte: 'Contacté', qualifie: 'Qualifié',
  rdv: 'RDV', gagne: 'Gagné', perdu: 'Perdu',
}
const statusColors: Record<string, string> = {
  recu: 'text-admin-muted bg-admin-surface border-admin-border',
  contacte: 'text-accent bg-accent/10 border-accent/20',
  qualifie: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  rdv: 'text-warning bg-warning/10 border-warning/30',
  gagne: 'text-success bg-success/10 border-success/30',
  perdu: 'text-danger bg-danger/10 border-danger/30',
}
const fitColors: Record<string, string> = {
  A: 'text-success bg-success/10 border-success/30',
  B: 'text-accent bg-accent/10 border-accent/20',
  C: 'text-warning bg-warning/10 border-warning/30',
  D: 'text-admin-muted bg-admin-surface border-admin-border',
}
const statuses = ['all', 'recu', 'contacte', 'qualifie', 'rdv', 'gagne', 'perdu']
const fits = ['all', 'A', 'B', 'C', 'D']

function scoreAI(c: Candidate): { score: number; verdict: string } {
  let score = 40
  const text = `${c.headline ?? ''} ${c.notes ?? ''} ${c.keyword ?? ''}`.toLowerCase()
  if (/scaler|systeme|automatis|scale/.test(text)) score += 20
  if (/agence|coach|freelance|consultant|fondateur/.test(text)) score += 15
  if (/budget|€|revenue|growth|senior/.test(text)) score += 15
  if (c.fit_grade === 'A') score += 15
  else if (c.fit_grade === 'B') score += 5
  else if (c.fit_grade === 'D') score -= 30
  if (/junior|étudiant|salarié/.test(text)) score -= 25
  score = Math.max(0, Math.min(100, score))
  const verdict = score >= 75 ? 'A — Qualifiable' : score >= 55 ? 'B — À confirmer' : score >= 35 ? 'C — À qualifier' : 'D — Hors cible'
  return { score, verdict }
}

export default function CandidaturesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [fitFilter, setFitFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Candidate | null>(null)
  const [editNotes, setEditNotes] = useState<Record<string, string>>({})
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLinkedIn, setNewLinkedIn] = useState('')

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      if (fitFilter !== 'all') params.set('fit', fitFilter)
      if (search) params.set('q', search)
      const res = await fetch(`/api/admin/candidates?${params}`)
      setCandidates(await res.json())
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }, [filter, fitFilter, search])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const handleStatusChange = async (c: Candidate, status: string) => {
    await fetch(`/api/admin/candidates/${c.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    toast.success(`${c.name} → ${statusLabels[status]}`)
    fetchCandidates()
  }

  const handleFitChange = async (c: Candidate, fit: string) => {
    await fetch(`/api/admin/candidates/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, fit_grade: fit }),
    })
    fetchCandidates()
  }

  const handleSaveNotes = async (c: Candidate) => {
    await fetch(`/api/admin/candidates/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, notes: editNotes[c.id] }),
    })
    toast.success('Notes sauvegardées')
    setEditNotes((prev) => { const n = { ...prev }; delete n[c.id]; return n })
    fetchCandidates()
  }

  const handleScoreAI = async (c: Candidate) => {
    const { score, verdict } = scoreAI(c)
    await fetch(`/api/admin/candidates/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, ai_score: score, ai_verdict: verdict }),
    })
    toast.success(`Score IA : ${score} — ${verdict}`)
    fetchCandidates()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await fetch(`/api/admin/candidates/${deleteTarget.id}`, { method: 'DELETE' })
    toast.success('Prospect supprimé')
    setDeleteTarget(null)
    fetchCandidates()
  }

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error('Nom requis'); return }
    await fetch('/api/admin/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, linkedin_url: newLinkedIn || null }),
    })
    toast.success('Prospect ajouté')
    setNewName(''); setNewLinkedIn(''); setAddOpen(false)
    fetchCandidates()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="font-syne font-bold text-admin-text text-xl">Prospects</h2>
          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{candidates.length}</span>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow hover:shadow-glow-lg transition-all"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Add form */}
      {addOpen && (
        <div className="bg-admin-surface border border-admin-border rounded-xl p-4 flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Nom *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 min-w-[160px] bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="URL LinkedIn"
            value={newLinkedIn}
            onChange={(e) => setNewLinkedIn(e.target.value)}
            className="flex-1 min-w-[200px] bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none"
          />
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium">Ajouter</button>
          <button onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg border border-admin-border text-admin-muted text-sm font-dm">Annuler</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex gap-1 p-1 bg-admin-bg border border-admin-border rounded-xl">
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-dm transition-all ${filter === s ? 'bg-admin-surface text-admin-text font-medium' : 'text-admin-muted hover:text-admin-text'}`}>
              {s === 'all' ? 'Tous' : statusLabels[s]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 bg-admin-bg border border-admin-border rounded-xl">
          {fits.map((f) => (
            <button key={f} onClick={() => setFitFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-dm transition-all ${fitFilter === f ? 'bg-admin-surface text-admin-text font-medium' : 'text-admin-muted hover:text-admin-text'}`}>
              {f === 'all' ? 'Fit' : `Fit ${f}`}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
          <input
            type="search"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-1.5 bg-admin-bg border border-admin-border rounded-lg text-sm font-dm text-admin-text placeholder-admin-muted focus:border-accent focus:outline-none w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-admin-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center"><p className="font-dm text-admin-muted">Aucun prospect.</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border" style={{ background: '#161B27' }}>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Fit</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Nom</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase hidden lg:table-cell">Headline</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Statut</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase hidden xl:table-cell">Score IA</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase hidden 2xl:table-cell">Notes</th>
                <th className="px-4 py-3 text-right font-dm text-xs text-admin-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-admin-surface transition-colors">
                  {/* Fit */}
                  <td className="px-4 py-3">
                    <select
                      value={c.fit_grade ?? ''}
                      onChange={(e) => handleFitChange(c, e.target.value)}
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded border bg-transparent cursor-pointer focus:outline-none ${c.fit_grade ? fitColors[c.fit_grade] : 'text-admin-muted border-admin-border'}`}
                    >
                      <option value="">—</option>
                      {['A', 'B', 'C', 'D'].map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </td>
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-dm text-sm text-admin-text font-medium truncate max-w-[140px]">{c.name}</p>
                      {c.linkedin_url && (
                        <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-admin-muted hover:text-accent flex-shrink-0">
                          <ExternalLink size={11} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-admin-muted">{c.source}</p>
                  </td>
                  {/* Headline */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="font-dm text-xs text-admin-muted truncate max-w-[200px]">{c.headline ?? '—'}</p>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c, e.target.value)}
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none bg-transparent ${statusColors[c.status]}`}
                    >
                      {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  {/* AI Score */}
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {c.ai_score !== null ? (
                      <div>
                        <span className={`font-mono text-xs font-bold ${c.ai_score >= 75 ? 'text-success' : c.ai_score >= 55 ? 'text-warning' : 'text-admin-muted'}`}>
                          {c.ai_score}
                        </span>
                        <p className="font-dm text-[10px] text-admin-muted truncate max-w-[120px]">{c.ai_verdict}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleScoreAI(c)}
                        className="font-mono text-[10px] px-2 py-0.5 rounded border border-admin-border text-admin-muted hover:border-accent hover:text-accent transition-colors"
                      >
                        Score IA
                      </button>
                    )}
                  </td>
                  {/* Notes */}
                  <td className="px-4 py-3 hidden 2xl:table-cell">
                    {editNotes[c.id] !== undefined ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={editNotes[c.id]}
                          onChange={(e) => setEditNotes((prev) => ({ ...prev, [c.id]: e.target.value }))}
                          className="w-40 bg-admin-bg border border-accent rounded px-2 py-0.5 text-xs font-dm text-admin-text focus:outline-none"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNotes(c) }}
                          autoFocus
                        />
                        <button onClick={() => handleSaveNotes(c)} className="text-accent text-xs font-mono">✓</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditNotes((prev) => ({ ...prev, [c.id]: c.notes ?? '' }))}
                        className="font-dm text-xs text-admin-muted hover:text-admin-text truncate max-w-[160px] text-left"
                      >
                        {c.notes ?? <span className="italic">Ajouter note…</span>}
                      </button>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-lg text-admin-muted hover:text-danger transition-colors"
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer le prospect"
        message={`Supprimer "${deleteTarget?.name}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Supprimer"
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/candidatures/ && git commit -m "feat(crm): candidatures page — list, filters, fit/status selects, notes, AI score"
```

---

### Task 10: CRM Kanban Page

**Files:**
- Create: `app/admin/crm/page.tsx`

- [ ] **Step 1: Create Kanban with native HTML5 drag-and-drop**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Candidate } from '@/lib/db-parse'
import { toast } from '@/components/admin/Toast'

const columns: { status: string; label: string; color: string }[] = [
  { status: 'recu',     label: '📥 Reçu',      color: 'border-admin-border' },
  { status: 'contacte', label: '✉️ Contacté',   color: 'border-accent/40' },
  { status: 'qualifie', label: '✅ Qualifié',   color: 'border-blue-400/40' },
  { status: 'rdv',      label: '📞 RDV',        color: 'border-warning/40' },
  { status: 'gagne',    label: '🏆 Gagné',      color: 'border-success/40' },
  { status: 'perdu',    label: '❌ Perdu',      color: 'border-danger/40' },
]

const fitColors: Record<string, string> = {
  A: 'text-success bg-success/10 border-success/30',
  B: 'text-accent bg-accent/10 border-accent/20',
  C: 'text-warning bg-warning/10 border-warning/30',
  D: 'text-admin-muted bg-admin-surface border-admin-border',
}

const fits = ['all', 'A', 'B', 'C', 'D']

export default function CRMPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [fitFilter, setFitFilter] = useState('all')
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const params = fitFilter !== 'all' ? `?fit=${fitFilter}` : ''
      const res = await fetch(`/api/admin/candidates${params}`)
      setCandidates(await res.json())
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }, [fitFilter])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const handleDrop = async (targetStatus: string) => {
    if (!dragging || dragOver === null) return
    const candidate = candidates.find((c) => c.id === dragging)
    if (!candidate || candidate.status === targetStatus) return

    // Optimistic update
    setCandidates((prev) => prev.map((c) => c.id === dragging ? { ...c, status: targetStatus as Candidate['status'] } : c))

    try {
      await fetch(`/api/admin/candidates/${dragging}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      })
      if (targetStatus === 'gagne') {
        toast.success(`🏆 ${candidate.name} — deal gagné ! Paiement créé.`)
      }
    } catch {
      toast.error('Erreur lors du déplacement')
      fetchCandidates()
    }
    setDragging(null)
    setDragOver(null)
  }

  const byStatus = (status: string) =>
    candidates.filter((c) => c.status === status)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-5 h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 flex-wrap flex-shrink-0">
        <h2 className="font-syne font-bold text-admin-text text-xl">Pipeline CRM</h2>
        <div className="flex gap-1 p-1 bg-admin-bg border border-admin-border rounded-xl">
          {fits.map((f) => (
            <button key={f} onClick={() => setFitFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-dm transition-all ${fitFilter === f ? 'bg-admin-surface text-admin-text font-medium' : 'text-admin-muted hover:text-admin-text'}`}>
              {f === 'all' ? 'Tous' : `Fit ${f}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 flex-1 min-h-0">
        {columns.map((col) => {
          const cards = byStatus(col.status)
          const isOver = dragOver === col.status
          return (
            <div
              key={col.status}
              className={`flex-shrink-0 w-56 flex flex-col rounded-xl border transition-all ${col.color} ${isOver ? 'bg-accent/5 border-accent' : 'bg-admin-surface'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.status) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.status)}
            >
              {/* Column header */}
              <div className="px-3 py-2.5 border-b border-admin-border flex-shrink-0">
                <p className="font-dm text-xs font-medium text-admin-text">{col.label}</p>
                <p className="font-mono text-[10px] text-admin-muted mt-0.5">{cards.length} prospect{cards.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[60px]">
                {cards.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragging(c.id)}
                    onDragEnd={() => { setDragging(null); setDragOver(null) }}
                    className={`bg-admin-bg border border-admin-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all hover:border-accent ${dragging === c.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      {c.fit_grade && (
                        <span className={`font-mono text-[9px] px-1 py-0.5 rounded border flex-shrink-0 ${fitColors[c.fit_grade]}`}>
                          {c.fit_grade}
                        </span>
                      )}
                      {c.linkedin_url && (
                        <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-admin-muted hover:text-accent ml-auto flex-shrink-0"
                        >
                          <ExternalLink size={10} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                    <p className="font-dm text-xs font-medium text-admin-text leading-tight">{c.name}</p>
                    {c.headline && (
                      <p className="font-mono text-[9px] text-admin-muted mt-1 line-clamp-2">{c.headline}</p>
                    )}
                    {c.ai_score !== null && (
                      <p className={`font-mono text-[9px] mt-1 font-bold ${c.ai_score >= 75 ? 'text-success' : c.ai_score >= 55 ? 'text-warning' : 'text-admin-muted'}`}>
                        IA: {c.ai_score}
                      </p>
                    )}
                  </div>
                ))}
                {cards.length === 0 && isOver && (
                  <div className="h-16 border-2 border-dashed border-accent/40 rounded-lg flex items-center justify-center">
                    <p className="font-mono text-[10px] text-accent">Déposer ici</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/crm/ && git commit -m "feat(crm): Kanban pipeline — native drag-and-drop, 6 columns, fit filter"
```

---

### Task 11: Closers + Paiements + Tweets Pages

**Files:**
- Create: `app/admin/closers/page.tsx`
- Create: `app/admin/paiements/page.tsx`
- Create: `app/admin/tweets/page.tsx`

- [ ] **Step 1: Create `app/admin/closers/page.tsx`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Closer, Task } from '@/lib/db-parse'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { toast } from '@/components/admin/Toast'

export default function ClosersPage() {
  const [closers, setClosers] = useState<Closer[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newTask, setNewTask] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [closersRes, tasksRes] = await Promise.all([
      fetch('/api/admin/closers'),
      fetch('/api/admin/tasks'),
    ])
    setClosers(await closersRes.json())
    setTasks(await tasksRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleAddCloser = async () => {
    if (!newName.trim()) { toast.error('Nom requis'); return }
    await fetch('/api/admin/closers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, email: newEmail }),
    })
    toast.success('Closer ajouté')
    setNewName(''); setNewEmail('')
    fetchAll()
  }

  const handleDeleteCloser = async () => {
    if (!deleteTarget) return
    await fetch(`/api/admin/closers/${deleteTarget}`, { method: 'DELETE' })
    toast.success('Closer supprimé')
    setDeleteTarget(null)
    fetchAll()
  }

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask }),
    })
    setNewTask('')
    fetchAll()
  }

  const handleToggleTask = async (task: Task) => {
    await fetch(`/api/admin/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !task.done }),
    })
    fetchAll()
  }

  const handleDeleteTask = async (id: string) => {
    await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8 max-w-[900px]">
      {/* Closers */}
      <div className="space-y-4">
        <h2 className="font-syne font-bold text-admin-text text-xl">Closers</h2>
        <div className="flex gap-3 flex-wrap">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom *"
            className="flex-1 min-w-[140px] bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none" />
          <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email"
            className="flex-1 min-w-[180px] bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none" />
          <button onClick={handleAddCloser} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow">
            <Plus size={14} /> Ajouter
          </button>
        </div>

        <div className="rounded-xl border border-admin-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border" style={{ background: '#161B27' }}>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Nom</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Email</th>
                <th className="px-4 py-3 text-right font-dm text-xs text-admin-muted uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {closers.map((cl) => (
                <tr key={cl.id} className="hover:bg-admin-surface">
                  <td className="px-4 py-3 font-dm text-sm text-admin-text">{cl.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-admin-muted">{cl.email ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteTarget(cl.id)} className="p-1.5 rounded-lg text-admin-muted hover:text-danger transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {closers.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center font-dm text-sm text-admin-muted">Aucun closer.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <h2 className="font-syne font-bold text-admin-text text-xl">Tâches ouvertes</h2>
        <div className="flex gap-3">
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask() }}
            placeholder="Ajouter une tâche..."
            className="flex-1 bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none" />
          <button onClick={handleAddTask} className="px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 bg-admin-surface border border-admin-border rounded-xl px-4 py-3">
              <input type="checkbox" checked={t.done} onChange={() => handleToggleTask(t)}
                className="w-4 h-4 rounded border-admin-border bg-admin-bg accent-accent cursor-pointer flex-shrink-0" />
              <p className={`font-dm text-sm flex-1 ${t.done ? 'line-through text-admin-muted' : 'text-admin-text'}`}>{t.title}</p>
              {t.candidate_name && <span className="font-mono text-[10px] text-admin-muted px-2 py-0.5 rounded bg-admin-bg border border-admin-border">{t.candidate_name}</span>}
              {t.due_date && <span className="font-mono text-[10px] text-admin-muted">{new Date(t.due_date).toLocaleDateString('fr-FR')}</span>}
              <button onClick={() => handleDeleteTask(t.id)} className="p-1 text-admin-muted hover:text-danger flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {tasks.length === 0 && <p className="font-dm text-sm text-admin-muted text-center py-6">Aucune tâche ouverte. 🎉</p>}
        </div>
      </div>

      <ConfirmModal isOpen={!!deleteTarget} title="Supprimer le closer" message="Supprimer ce closer ?"
        onConfirm={handleDeleteCloser} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
```

- [ ] **Step 2: Create `app/admin/paiements/page.tsx`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Payment } from '@/lib/db-parse'
import { toast } from '@/components/admin/Toast'

function formatEuros(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}
function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PaiementsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/payments')
    setPayments(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const handleMarkPaid = async (id: string) => {
    await fetch(`/api/admin/payments/${id}`, { method: 'PUT' })
    toast.success('Paiement marqué comme payé ✅')
    fetchPayments()
  }

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-syne font-bold text-admin-text text-xl">Paiements</h2>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 max-w-[500px]">
        <div className="bg-admin-surface border border-success/30 rounded-xl p-4">
          <p className="font-dm text-xs text-admin-muted mb-1">Encaissé</p>
          <p className="font-syne font-bold text-success text-xl">{formatEuros(totalPaid)}</p>
        </div>
        <div className="bg-admin-surface border border-admin-border rounded-xl p-4">
          <p className="font-dm text-xs text-admin-muted mb-1">En attente</p>
          <p className="font-syne font-bold text-warning text-xl">{formatEuros(totalPending)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-admin-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border" style={{ background: '#161B27' }}>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Client</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Montant</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Statut</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-dm text-xs text-admin-muted uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-admin-surface">
                  <td className="px-4 py-3 font-dm text-sm text-admin-text">{p.candidate_name ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm text-admin-text font-bold">{formatEuros(p.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${p.status === 'paid' ? 'text-success bg-success/10 border-success/30' : 'text-warning bg-warning/10 border-warning/30'}`}>
                      {p.status === 'paid' ? 'Payé' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-dm text-xs text-admin-muted">{formatDate(p.paid_at || p.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {p.status === 'pending' && (
                      <button onClick={() => handleMarkPaid(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-success/15 text-success text-xs font-dm font-medium hover:bg-success/25 transition-colors border border-success/30">
                        Marquer payé
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center font-dm text-admin-muted text-sm">Aucun paiement.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/admin/tweets/page.tsx`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Tweet } from '@/lib/db-parse'
import { toast } from '@/components/admin/Toast'

export default function TweetsPage() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  const fetchTweets = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/tweets')
    setTweets(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchTweets() }, [fetchTweets])

  const handleAdd = async () => {
    if (!content.trim()) { toast.error('Contenu requis'); return }
    await fetch('/api/admin/tweets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, scheduled_at: scheduledAt || null }),
    })
    setContent(''); setScheduledAt('')
    fetchTweets()
  }

  const handlePublish = async (t: Tweet) => {
    await fetch(`/api/admin/tweets/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: true }),
    })
    toast.success('Tweet marqué comme publié')
    fetchTweets()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/tweets/${id}`, { method: 'DELETE' })
    fetchTweets()
  }

  const published = tweets.filter((t) => t.published)
  const scheduled = tweets.filter((t) => !t.published && t.scheduled_at)
  const drafts = tweets.filter((t) => !t.published && !t.scheduled_at)

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  function TweetCard({ tweet }: { tweet: Tweet }) {
    return (
      <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-2">
        <p className="font-dm text-sm text-admin-text whitespace-pre-wrap">{tweet.content}</p>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-3">
            {tweet.published && (
              <span className="font-mono text-[10px] text-admin-muted">❤ {tweet.likes} · 👁 {tweet.impressions}</span>
            )}
            {tweet.scheduled_at && !tweet.published && (
              <span className="font-mono text-[10px] text-warning">📅 {formatDate(tweet.scheduled_at)}</span>
            )}
            {!tweet.published && !tweet.scheduled_at && (
              <span className="font-mono text-[10px] text-admin-muted">Brouillon</span>
            )}
          </div>
          <div className="flex gap-2">
            {!tweet.published && (
              <button onClick={() => handlePublish(tweet)}
                className="px-3 py-1 rounded-lg bg-accent/15 text-accent text-xs font-dm border border-accent/30 hover:bg-accent/25 transition-colors">
                Publié ✓
              </button>
            )}
            <button onClick={() => handleDelete(tweet.id)} className="p-1 text-admin-muted hover:text-danger">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[800px]">
      <h2 className="font-syne font-bold text-admin-text text-xl">Tweets</h2>

      {/* Compose */}
      <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Rédiger un tweet..."
          rows={3}
          maxLength={280}
          className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2.5 text-admin-text font-dm text-sm placeholder-admin-muted focus:border-accent focus:outline-none resize-none"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
            className="bg-admin-bg border border-admin-border rounded-lg px-3 py-1.5 text-admin-text font-dm text-xs focus:border-accent focus:outline-none" />
          <span className="font-mono text-xs text-admin-muted ml-auto">{content.length}/280</span>
          <button onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow">
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {scheduled.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-xs text-warning uppercase tracking-wider">Planifiés ({scheduled.length})</p>
              {scheduled.map((t) => <TweetCard key={t.id} tweet={t} />)}
            </div>
          )}
          {drafts.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-xs text-admin-muted uppercase tracking-wider">Brouillons ({drafts.length})</p>
              {drafts.map((t) => <TweetCard key={t.id} tweet={t} />)}
            </div>
          )}
          {published.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-xs text-success uppercase tracking-wider">Publiés ({published.length})</p>
              {published.map((t) => <TweetCard key={t.id} tweet={t} />)}
            </div>
          )}
          {tweets.length === 0 && <p className="font-dm text-sm text-admin-muted text-center py-8">Aucun tweet.</p>}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit all three pages**

```bash
git add app/admin/closers/ app/admin/paiements/ app/admin/tweets/
git commit -m "feat(crm): closers, paiements, tweets admin pages"
```

---

### Task 12: Build & Deploy

**Files:** None (build and push to server)

- [ ] **Step 1: Build Docker image**

```bash
cd C:\Users\Louka\Documents\agence_automatisation\personnal_site
docker build -t louka-site:latest .
```

Expected: build successful, no errors.

- [ ] **Step 2: Transfer and deploy**

```bash
docker save louka-site:latest | ssh louka@192.168.1.26 "docker load"
ssh louka@192.168.1.26 "cd /home/louka/louka-site && docker compose down && docker compose up -d"
```

- [ ] **Step 3: Run data migration**

```bash
node scripts/migrate-crm.mjs
```

Expected: `130 candidates migrated`, `1 closer migrated`.

- [ ] **Step 4: Smoke test**

```bash
ssh louka@192.168.1.26 "curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@loukamillon.com\",\"password\":\"admin2024!\"}' -c /tmp/c.txt && curl -s 'http://localhost:3000/api/admin/dashboard' -b /tmp/c.txt | node -e \"process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).candidates,'candidates, fit A:',JSON.parse(d).fit_a))\""
```

Expected: `130 candidates, fit A: N`

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "chore: deploy CRM migration to production"
git push origin main
```

---

## Self-Review

**Spec coverage check:**

| Feature | Task |
|---------|------|
| ✅ MySQL tables (candidates, closers, payments, tasks, tweets, logs) | Task 1 |
| ✅ Data migration 130 candidates SQLite → MySQL | Task 2 |
| ✅ db-parse helpers for all new types | Task 3 |
| ✅ Candidates CRUD API + status auto-actions | Task 4 |
| ✅ Closers/Payments/Tasks/Tweets/Logs APIs | Task 5 |
| ✅ Dashboard KPIs API | Task 6 |
| ✅ Sidebar with CRM/Contenu/Site sections | Task 7 |
| ✅ Dashboard page (KPIs, objectif 2000€, funnel) | Task 8 |
| ✅ Candidatures page (table, filters, fit/status, notes, AI score) | Task 9 |
| ✅ CRM Kanban (drag-and-drop, 6 columns, fit filter) | Task 10 |
| ✅ Closers + Tâches page | Task 11 |
| ✅ Paiements page (mark paid, totals) | Task 11 |
| ✅ Tweets page (draft/scheduled/published) | Task 11 |
| ✅ Settings: Telegram + Anthropic fields | Already done (before plan) |
| ✅ Build + deploy + data migration | Task 12 |

**Placeholder scan:** None found. All steps contain real code.

**Type consistency check:**
- `Candidate` type defined once in Task 3 `lib/db-parse.ts`, used in Tasks 4, 9, 10.
- `Payment.amount` is always in cents (integer). `formatEuros(cents)` divides by 100.
- Status values: always lowercase strings matching MySQL ENUM: `recu|contacte|qualifie|rdv|gagne|perdu`.
- `parseCandidate`, `parseCloser`, `parsePayment`, `parseTask`, `parseTweet`, `parseLog` all defined in Task 3.
