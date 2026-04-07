import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'louka-site-secret-please-change-in-prod'
)
const COOKIE_NAME = 'louka_admin_session'

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginRoute = request.nextUrl.pathname === '/admin/login'

  if (!isAdminRoute) return NextResponse.next()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (token) {
    try {
      await jwtVerify(token, SECRET)
      if (isLoginRoute) {
        return NextResponse.redirect(new URL('/admin/articles', request.url))
      }
      return NextResponse.next({ request: { headers: requestHeaders } })
    } catch {
      // Invalid/expired token — fall through to redirect
    }
  }

  if (!isLoginRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/admin/:path*'],
}
