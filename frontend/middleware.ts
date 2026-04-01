import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', 
  '/auth/forgot-password', '/auth/reset-password',
  '/privacy', '/terms', '/cookies', '/sitemap']

const AUTH_ROUTES = ['/auth/login', '/auth/register', 
  '/auth/forgot-password', '/auth/reset-password']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value 
    || request.cookies.get('access_token')?.value

  const { pathname } = request.nextUrl

  // If logged in and trying to access auth pages or landing → redirect to gallery
  if (token && (pathname === '/' || AUTH_ROUTES.some(r => pathname.startsWith(r)))) {
    return NextResponse.redirect(new URL('/gallery', request.url))
  }

  // If not logged in and trying to access protected pages → redirect to login
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r))
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)']
}
