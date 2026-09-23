/**
 * Bigman Commerce — Security Utilities
 *
 * Centralised helpers for input sanitisation, validation,
 * order-number generation, and security-header creation.
 */

import type { NextRequest } from 'next/server'

// ------------------------------------------------------------------
// Startup validation
// ------------------------------------------------------------------

/**
 * Validate critical environment variables at startup.
 * Call once in instrumentation or layout — app should refuse to boot without these.
 */
export function validateEnv(): void {
  const missing: string[] = []

  // Only enforce NEXTAUTH_SECRET at runtime, not during `next build`
  // (Next.js sets NODE_ENV=production during build, but env vars may not all be present)
  const isBuildTime = !!process.env.NEXT_BUILD_ID || !process.env.NEXTAUTH_URL

  if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production' && !isBuildTime) {
    missing.push('NEXTAUTH_SECRET')
  }
  if (!process.env.DATABASE_URL && !isBuildTime) {
    missing.push('DATABASE_URL')
  }

  if (missing.length > 0) {
    throw new Error(
      `[Bigman] FATAL: Missing required environment variables: ${missing.join(', ')}. ` +
      'The application cannot start safely. Please set them in .env or your deployment config.'
    )
  }
}

/**
 * Log a warning (non-fatal) for recommended env vars.
 */
export function warnMissingEnv(): void {
  if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV !== 'production') {
    console.warn(
      '[Bigman] WARNING: NEXTAUTH_SECRET is not set. JWTs are unsigned and forgeable. ' +
      'Generate one with: openssl rand -base64 32'
    )
  }
}

// ------------------------------------------------------------------
// Input sanitisation
// ------------------------------------------------------------------

/**
 * Strip HTML tags, trim whitespace, and cap length at 10 000 chars.
 */
export function sanitizeInput(str: string): string {
  return str
    .replace(/<[^>]*>/g, '')   // strip HTML tags
    .trim()
    .slice(0, 10_000)
}

// ------------------------------------------------------------------
// Validation helpers
// ------------------------------------------------------------------

/**
 * Basic e-mail format check (does NOT verify deliverability).
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Kenyan phone number validation.
 * Accepts formats: +2547XXXXXXXX, +2541XXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  return /^(\+254|0)[17]\d{8}$/.test(cleaned)
}

// ------------------------------------------------------------------
// Order number generator
// ------------------------------------------------------------------

/**
 * Generate a deterministic-looking order number.
 * Format: BMC-YYYYMMDD-XXXX  (4 random hex chars)
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `BMC-${date}-${rand}`
}

// ------------------------------------------------------------------
// Auth helpers (cookie-based, no next-auth import)
// ------------------------------------------------------------------

/**
 * Check whether the request carries a NextAuth session cookie.
 * This is a lightweight gate — actual role checks belong in API routes.
 */
export function isAuthenticated(request: NextRequest): boolean {
  // NextAuth v4 sets a cookie named "next-auth.session-token" (httpOnly).
  // In production / secure envs it may be prefixed with "__Secure-".
  return (
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token')
  )
}

// ------------------------------------------------------------------
// Security headers
// ------------------------------------------------------------------

/**
 * Returns a plain object of security headers applied to every response.
 */
export function createSecurityHeaders(): HeadersInit {
  const isProd = process.env.NODE_ENV === 'production'

  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '0',
    'X-Download-Options': 'noopen',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    // HSTS — only in production (would break local HTTP dev)
    ...(isProd ? { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload' } : {}),
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  }
}
