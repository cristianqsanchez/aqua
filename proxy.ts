import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/proxy'
import { routing } from './i18n/routing'
import { defaultLocale, locales } from './i18n/config'

const handleI18n = createMiddleware(routing)

const PUBLIC_ROUTES = ['login', 'error']
const PROTECTED_ROUTES = ['dashboard', 'sales', 'leads', 'orders', 'settings']

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  if (locales.includes(firstSegment as typeof locales[number])) {
    return firstSegment
  }
  return defaultLocale
}

function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  if (locales.includes(firstSegment as typeof locales[number])) {
    return '/' + segments.slice(1).join('/') || '/'
  }
  return pathname
}

function isPublicRoute(path: string): boolean {
  const cleanPath = path === '/' ? path : path.replace(/\/$/, '')
  return PUBLIC_ROUTES.some(route => cleanPath === `/${route}`)
}

function isProtectedRoute(path: string): boolean {
  const cleanPath = path === '/' ? path : path.replace(/\/$/, '')
  return PROTECTED_ROUTES.some(route => cleanPath.startsWith(`/${route}`))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const i18nResponse = handleI18n(request)

  if (i18nResponse.status === 404) {
    return i18nResponse
  }

  const locale = getLocaleFromPath(pathname)
  const pathWithoutLocale = getPathWithoutLocale(pathname)

  const { response: authResponse, user } = await updateSession(request)

  authResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'content-encoding') {
      i18nResponse.headers.set(key, value)
    }
  })

  if (!user && isProtectedRoute(pathWithoutLocale)) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  if (user && isPublicRoute(pathWithoutLocale) && pathWithoutLocale !== '/error') {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  return i18nResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
