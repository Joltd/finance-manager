import { NextRequest, NextResponse } from 'next/server'

export function setAccessTokenCookie(response: NextResponse, accessToken: string) {
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 15 * 60,
  })
}

export function setRefreshTokenCookie(response: NextResponse, refreshToken: string) {
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
}

export function cleanupCookie(response: NextResponse) {
  response.cookies.set('accessToken', '', {
    expires: new Date(0),
    path: '/',
  })
  response.cookies.set('refreshToken', '', {
    expires: new Date(0),
    path: '/',
  })
}

export async function refreshRequest(
  request: NextRequest,
): Promise<{ accessToken: string } | undefined> {
  const refreshToken = request.cookies.get('refreshToken')?.value

  const target = `${process.env.BACKEND_HOST}/api/v1/user/auth/refresh`
  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken,
    }),
  }
  const response = await fetch(target, init)
  if (!response.ok) {
    console.error(response)
    return undefined
  }

  const json = await response.json()
  if (!json.success) {
    console.log(json)
    return undefined
  }

  return json.body
}

export async function regularRequest(request: NextRequest, accessToken?: string) {
  const target = `${process.env.BACKEND_HOST}${request.nextUrl.pathname}?${request.nextUrl.searchParams}`

  const headers = new Headers(request.headers)
  if (!!accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const init: any = {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    duplex: 'half',
  }
  return await fetch(target, init)
}
