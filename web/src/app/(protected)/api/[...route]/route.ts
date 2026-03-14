import { NextRequest, NextResponse } from 'next/server'
import {
  refreshRequest,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  authenticatedRequest,
} from '@/lib/auth'

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function isAuthFailure(status: number): boolean {
  return status === 401 || status === 403
}

async function protectedRequest(req: NextRequest): Promise<NextResponse> {
  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  if (accessToken) {
    const res = await authenticatedRequest(req, accessToken, body)
    if (!isAuthFailure(res.status)) {
      return res
    }
    await res.arrayBuffer() // drain and release the response body stream
  }

  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) {
    return unauthorized()
  }

  const refreshRes = await refreshRequest(refreshToken)
  if (!refreshRes) {
    return unauthorized()
  }

  const res = await authenticatedRequest(req, refreshRes.accessToken, body)
  if (isAuthFailure(res.status)) {
    return unauthorized()
  }

  res.cookies.set(ACCESS_TOKEN_COOKIE, refreshRes.accessToken, accessTokenCookieOptions)
  if (refreshRes.refreshToken) {
    res.cookies.set(REFRESH_TOKEN_COOKIE, refreshRes.refreshToken, refreshTokenCookieOptions)
  }
  return res
}

type RouteContext = { params: Promise<{ route: string[] }> }

const handler = (req: NextRequest, _context: RouteContext) => protectedRequest(req)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
