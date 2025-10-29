import { NextRequest, NextResponse } from 'next/server'
import { cleanupCookie, refreshRequest, regularRequest, setAccessTokenCookie } from '@/lib/auth'

async function exchange(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value
  const response = await regularRequest(request, accessToken)
  if (response.status === 401) {
    console.warn('Unauthorized, try to refresh')
    const refreshResult = await refreshRequest(request)
    if (refreshResult) {
      console.warn('Refresh completed successfully')
      const response = await regularRequest(request, refreshResult.accessToken)
      const responseWrapper = new NextResponse(response.body, {
        status: response.status,
        headers: response.headers,
      })
      setAccessTokenCookie(responseWrapper, refreshResult.accessToken)
      return responseWrapper
    } else {
      const responseWrapper = new NextResponse(response.body, {
        status: response.status,
        headers: response.headers,
      })
      cleanupCookie(responseWrapper)
      return responseWrapper
    }
  }
  return response
}

export const GET = (request: NextRequest) => exchange(request)

export const POST = (request: NextRequest) => exchange(request)

export const PUT = (request: NextRequest) => exchange(request)

export const PATCH = (request: NextRequest) => exchange(request)

export const DELETE = (request: NextRequest) => exchange(request)
