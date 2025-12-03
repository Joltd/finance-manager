import { NextRequest, NextResponse } from 'next/server'

export function GET(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value
  if (!accessToken) {
    return new NextResponse(null, { status: 403 })
  }
  const host = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : ''
  return new NextResponse(`${host}/sse?access_token=${accessToken}`, { status: 200 })
}
