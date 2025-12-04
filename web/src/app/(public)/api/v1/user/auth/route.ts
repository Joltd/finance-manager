import { NextRequest, NextResponse } from 'next/server'
import { setAccessTokenCookie, setRefreshTokenCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { login, password } = await request.json()

  const target = `${process.env.BACKEND_HOST}/api/v1/user/auth`
  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      login,
      password,
    }),
  }
  const response = await fetch(target, init)
  if (!response.ok) {
    return response
  }

  const json = await response.json()

  const actualResponse = NextResponse.json({ success: true })
  setAccessTokenCookie(actualResponse, json.body.accessToken)
  setRefreshTokenCookie(actualResponse, json.body.refreshToken)
  return actualResponse
}
