import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSecurityHeaders, isAuthenticated } from '@/lib/security'

// ------------------------------------------------------------------
// A) Security headers — applied to every response
// ------------------------------------------------------------------

const securityHeaders = createSecurityHeaders()

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value as string)
  }
  return response
}

// ------------------------------------------------------------------
// B) In-memory rate limiter (Map-based, no external deps)
// ------------------------------------------------------------------

interface RateEntry {
  timestamps: number[]
}

const WINDOW_MS = 60_000 // 1 minute

/** Map of ip → { timestamps: number[] } */
const rateStore = new Map<string, RateEntry>()

/** Prune entries older than the window to prevent memory leaks */
function pruneStale(now: number) {
  for (const [ip, entry] of rateStore) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS)
    if (entry.timestamps.length === 0) {
      rateStore.delete(ip)
    }
  }
}

/**
 * Check rate limit for a given IP / bucket.
 * Returns `true` if the request should be blocked (429).
 * Sets `retryAfterSeconds` as a side-effect.
 */
function isRateLimited(ip: string, limit: number, retryAfterSeconds: { value: number }): boolean {
  const now = Date.now()

  // Periodic cleanup (every ~50 requests to amortise cost)
  if (rateStore.size > 500) {
    pruneStale(now)
  }

  let entry = rateStore.get(ip)
  if (!entry) {
    entry = { timestamps: [] }
    rateStore.set(ip, entry)
  }

  // Slide window: drop timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS)

  if (entry.timestamps.length >= limit) {
    // Compute when the oldest entry expires
    const oldest = entry.timestamps[0]
    retryAfterSeconds.value = Math.ceil((oldest + WINDOW_MS - now) / 1000)
    return true
  }

  entry.timestamps.push(now)
  return false
}

// ------------------------------------------------------------------
// Rate-limit tiers (requests per minute per IP)
// ------------------------------------------------------------------

const RATE_LIMITS: Record<string, number> = {
  '/api/auth': 5,
  '/api/search': 30,
  '/api/products': 60,
  '/api/admin': 60,
}

const DEFAULT_API_RATE = 30

function getRateLimit(pathname: string): number {
  for (const [prefix, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) return limit
  }
  return DEFAULT_API_RATE
}

// ------------------------------------------------------------------
// Extract client IP
// ------------------------------------------------------------------

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // First IP in the chain is the original client
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  // Fallback
  return '0.0.0.0'
}

// ------------------------------------------------------------------
// Middleware entry
// ------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ----- D) Trailing slash normalisation ---------------------------
  // Redirect paths ending in / (except root) to non-trailing version
  if (pathname !== '/' && pathname.endsWith('/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(0, -1)
    return withSecurityHeaders(NextResponse.redirect(url, 308))
  }

  // ----- C) Admin page protection ----------------------------------
  // /admin/* pages → redirect to login if no session cookie
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/')) {
    if (!isAuthenticated(request)) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('callbackUrl', pathname)
      return withSecurityHeaders(NextResponse.redirect(loginUrl, 302))
    }
  }

  // ----- E) Admin API authentication gate --------------------------
  if (pathname.startsWith('/api/admin')) {
    if (!isAuthenticated(request)) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 },
        ),
      )
    }
  }

  // ----- B) Rate limiting for /api/* routes ------------------------
  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request)
    const limit = getRateLimit(pathname)
    const retryAfter = { value: 0 }

    if (isRateLimited(ip, limit, retryAfter)) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Too many requests', retryAfter: retryAfter.value },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfter.value),
            },
          },
        ),
      )
    }
  }

  // ----- Pass through with security headers ------------------------
  return withSecurityHeaders(NextResponse.next())
}

// ------------------------------------------------------------------
// Matcher — run on all routes except _next/static, _next/image, etc.
// ------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public folder assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon\.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}