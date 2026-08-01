import { NextRequest, NextResponse } from 'next/server'
import { backendRequest } from '@/lib/api'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  refreshRequest,
} from '@/lib/auth'

export const dynamic = 'force-dynamic'

function isAuthFailure(status: number): boolean {
  return status === 401 || status === 403
}

function upstreamHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'text/event-stream',
  }
}

function streamResponse(upstream: Response): NextResponse {
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

function unauthorized(): NextResponse {
  return new NextResponse(null, { status: 401 })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  if (accessToken) {
    const upstream = await backendRequest('/sse', '', {
      headers: upstreamHeaders(accessToken),
      signal: req.signal,
    })
    if (!isAuthFailure(upstream.status)) {
      return streamResponse(upstream)
    }
    await upstream.body?.cancel()
  }

  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) {
    return unauthorized()
  }

  const refreshed = await refreshRequest(refreshToken)
  if (!refreshed) {
    return unauthorized()
  }

  const upstream = await backendRequest('/sse', '', {
    headers: upstreamHeaders(refreshed.accessToken),
    signal: req.signal,
  })
  if (isAuthFailure(upstream.status)) {
    await upstream.body?.cancel()
    return unauthorized()
  }

  const res = streamResponse(upstream)
  res.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, accessTokenCookieOptions)
  if (refreshed.refreshToken) {
    res.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, refreshTokenCookieOptions)
  }
  return res
}
