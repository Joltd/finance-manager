import { NextRequest } from 'next/server'
import { userUrls } from '@/api/user'
import type { BackendResponse } from '@/types/common/common'
import { AuthenticationRefreshResponse } from '@/types/common/auth'
import { backendNextRequest, backendRequest } from '@/lib/api'

export const ACCESS_TOKEN_COOKIE = 'accessToken'
export const REFRESH_TOKEN_COOKIE = 'refreshToken'

const isProd = process.env.NODE_ENV === 'production'

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict' as const,
  path: '/',
}

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict' as const,
  path: '/',
}

export async function authenticatedRequest(req: NextRequest, accessToken: string, body?: BodyInit) {
  return backendNextRequest(req, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  })
}

export async function refreshRequest(
  refreshToken: string,
): Promise<AuthenticationRefreshResponse | null> {
  try {
    const res = await backendRequest(userUrls.refresh, '', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) {
      return null
    }
    const data: BackendResponse<AuthenticationRefreshResponse> = await res.json()
    return data.success ? data.body : null
  } catch {
    return null
  }
}
