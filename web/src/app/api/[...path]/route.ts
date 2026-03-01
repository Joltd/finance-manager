import { NextRequest, NextResponse } from 'next/server'

const BACKEND_HOST = process.env.BACKEND_HOST

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl
  const targetUrl = `${BACKEND_HOST}${pathname}${search}`

  const requestHeaders = new Headers(request.headers)
  requestHeaders.delete('host')

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: requestHeaders,
    body:
      request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.arrayBuffer()
        : undefined,
    // @ts-expect-error – Node.js fetch supports duplex
    duplex: 'half',
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('transfer-encoding')

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest) {
  return proxyRequest(request)
}

export async function POST(request: NextRequest) {
  return proxyRequest(request)
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request)
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request)
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request)
}

export async function HEAD(request: NextRequest) {
  return proxyRequest(request)
}

export async function OPTIONS(request: NextRequest) {
  return proxyRequest(request)
}
