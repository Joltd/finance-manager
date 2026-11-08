import { NextRequest, NextResponse } from 'next/server'
import {
  refreshRequest,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  authenticatedRequest,
  setAuthCookies,
} from '@/lib/auth'

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Only 401 means the token is missing, expired or invalid. 403 is a legitimate
// "authenticated but not allowed" answer and must reach the client unchanged.
function isUnauthorized(status: number): boolean {
  return status === 401
}

async function protectedRequest(req: NextRequest): Promise<NextResponse> {
  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  if (accessToken) {
    const res = await authenticatedRequest(req, accessToken, body)
    if (!isUnauthorized(res.status)) {
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
  if (isUnauthorized(res.status)) {
    return unauthorized()
  }

  setAuthCookies(res, refreshRes.accessToken, refreshRes.refreshToken)
  return res
}

type RouteContext = { params: Promise<{ route: string[] }> }

const handler = (req: NextRequest, _context: RouteContext) => protectedRequest(req)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
