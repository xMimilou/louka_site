import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import pool from '@/lib/db'
import { signSession, COOKIE_NAME } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const [rows] = await pool.execute(
      'SELECT id, email, password_hash FROM admin_users WHERE email = ?',
      [email]
    ) as [Array<{ id: string; email: string; password_hash: string }>, unknown]

    const user = rows[0]
    if (!user) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 })
    }

    const valid = await compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 })
    }

    const token = await signSession({ userId: user.id, email: user.email })

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
