import { NextResponse } from 'next/server'
import { cleanupCookie } from '@/lib/auth'

export function GET() {
  const response = new NextResponse(null, { status: 200 })
  cleanupCookie(response)
  return response
}
