import { cookies } from 'next/headers'
import { verifySession } from './session'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('louka_admin_session')?.value
  if (!token) return null
  return verifySession(token)
}

export function unauthorized() {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}
