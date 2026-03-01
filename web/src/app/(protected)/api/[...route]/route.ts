import { NextRequest, NextResponse } from 'next/server'
import {
  refreshRequest,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  authenticatedRequest,
} from '@/lib/auth'

function loginRedirect(req: NextRequest): NextResponse {
  const redirectUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)
  return NextResponse.redirect(new URL(`/login?redirectUrl=${redirectUrl}`, req.nextUrl.origin))
}

function isAuthFailure(status: number): boolean {
  return status === 401 || status === 403
}

async function protectedProxy(req: NextRequest): Promise<NextResponse> {
  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  if (accessToken) {
    const res = await authenticatedRequest(req, accessToken, body)
    if (!isAuthFailure(res.status)) {
      return res
    }
    await res.body?.cancel()
  }

  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) {
    return loginRedirect(req)
  }

  const refreshRes = await refreshRequest(refreshToken)
  if (!refreshRes) {
    return loginRedirect(req)
  }

  const res = await authenticatedRequest(req, refreshRes.accessToken, body)
  if (isAuthFailure(res.status)) {
    return loginRedirect(req)
  }

  res.cookies.set(ACCESS_TOKEN_COOKIE, refreshRes.accessToken, accessTokenCookieOptions)
  if (refreshRes.refreshToken) {
    res.cookies.set(REFRESH_TOKEN_COOKIE, refreshRes.refreshToken, refreshTokenCookieOptions)
  }
  return res
}

export const GET = protectedProxy
export const POST = protectedProxy
export const PUT = protectedProxy
export const PATCH = protectedProxy
export const DELETE = protectedProxy
