import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const WINDOW_MS = 15_000
const MAX_REQ = 30
const hits = new Map<string, { count: number; ts: number }>()

export function middleware(req: NextRequest){
  const res = NextResponse.next()
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=()')

  if (req.nextUrl.pathname.startsWith('/api/')){
    const ip = req.ip ?? '127.0.0.1'
    const now = Date.now()
    const entry = hits.get(ip) || { count: 0, ts: now }
    if (now - entry.ts > WINDOW_MS){
      hits.set(ip, { count: 1, ts: now })
    } else {
      entry.count += 1
      hits.set(ip, entry)
      if (entry.count > MAX_REQ) return new NextResponse('Too Many Requests', { status: 429 })
    }
  }
  return res
}

export const config = { matcher: ['/api/:path*'] }
