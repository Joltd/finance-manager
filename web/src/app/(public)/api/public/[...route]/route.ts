import { backendNextRequest } from '@/lib/api'
import { NextRequest } from 'next/server'

type RouteContext = { params: Promise<{ route: string[] }> }

const handler = (req: NextRequest, _context: RouteContext) => backendNextRequest(req)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
