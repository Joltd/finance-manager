import { NextRequest, NextResponse } from 'next/server'
import type { BackendRequestOptions } from '@/types/common/common'

const BACKEND_HOST = process.env.BACKEND_HOST

export function buildPath(template: string, params: Record<string, string> | undefined): string {
  if (!params) return template
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(value)),
    template,
  )
}

export async function backendRequest(
  path: string,
  search: string = '',
  options?: RequestInit,
): Promise<Response> {
  const actualUrl = `${BACKEND_HOST}${path}${search}`
  return fetch(actualUrl, {
    ...options,
    // @ts-expect-error — Node 18+ fetch option
    duplex: 'half',
  })
}

export async function backendNextRequest(
  req: NextRequest,
  options?: BackendRequestOptions,
): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl

  const headers = new Headers({
    ...req.headers,
    ...options?.headers,
  })
  headers.delete('host')

  const body =
    req.method !== 'GET' && req.method !== 'HEAD'
      ? (options?.body ?? (await req.arrayBuffer()))
      : undefined

  const response = await backendRequest(pathname, search, {
    method: req.method,
    headers,
    body,
  })

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  })
}
