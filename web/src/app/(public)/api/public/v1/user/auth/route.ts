import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies } from '@/lib/auth'
import { BackendResponse } from '@/types/common/common'
import { AuthenticationResponse } from '@/types/common/auth'
import { backendNextRequest } from '@/lib/api'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const backendRes = await backendNextRequest(req)
  const data: BackendResponse<AuthenticationResponse> = await backendRes.json()

  if (!data.success) {
    return NextResponse.json(
      { success: false, error: data.error },
      { status: backendRes.status, headers: backendRes.headers },
    )
  }

  const { accessToken, refreshToken } = data.body
  const res = NextResponse.json(
    { success: true, body: null },
    { status: backendRes.status, headers: backendRes.headers },
  )
  setAuthCookies(res, accessToken, refreshToken)
  return res
}
