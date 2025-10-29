import { NextRequest, NextResponse } from 'next/server'
import { authRequest, setAccessTokenCookie, setRefreshTokenCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const result = await authRequest(request)
  if (!result) {
    return NextResponse.json({ success: false })
  }

  const response = NextResponse.json({ success: true })
  setAccessTokenCookie(response, result.accessToken)
  setRefreshTokenCookie(response, result.refreshToken)
  return response
}
