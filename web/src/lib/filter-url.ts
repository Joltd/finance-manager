'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'

export function readParam(params: URLSearchParams, key: string): Record<string, unknown> {
  const value = params.get(key)
  return !value
    ? {}
    : {
        [key]: value,
      }
}

export function readNumberRangeParam(params: URLSearchParams, key: string): Record<string, unknown> {
  const from = params.get(`${key}From`)
  const to = params.get(`${key}To`)
  return !from && !to
    ? {}
    : {
        [key]: {
          from: from ? Number(from) : undefined,
          to: to ? Number(to) : undefined,
        },
      }
}

export function readDateRangeParam(params: URLSearchParams, key: string): Record<string, unknown> {
  const from = params.get(`${key}From`)
  const to = params.get(`${key}To`)
  return !from && !to
    ? {}
    : {
        [key]: {
          from: from ? parseISO(from) : undefined,
          to: to ? parseISO(to) : undefined,
        },
      }
}

export function readIdsParam(params: URLSearchParams, key: string): Record<string, unknown> {
  const value = params.get(key)
  return !value
    ? {}
    : {
        [key]: value.split(',').filter(Boolean),
      }
}

//

export function writeParam(values: Record<string, unknown>, params: URLSearchParams, key: string) {
  const value = values[key] as string
  if (!value) {
    return
  }

  params.set(key, value)
}

export function writeNumberRangeParam(values: Record<string, unknown>, params: URLSearchParams, key: string) {
  const value = values[key] as { from?: number, to?: number }
  if (!value) {
    return
  }

  if (value.from) {
    params.set(`${key}From`, value.from.toString())
  }

  if (value.to) {
    params.set(`${key}To`, value.to.toString())
  }
}

export function writeDateRangeParam(values: Record<string, unknown>, params: URLSearchParams, key: string) {
  const value = values[key] as { from?: Date; to?: Date }
  if (!value) {
    return
  }

  if (value.from) {
    params.set(`${key}From`, format(value.from, 'yyyy-MM-dd'))
  }

  if (value.to) {
    params.set(`${key}To`, format(value.to, 'yyyy-MM-dd'))
  }
}

export function writeIdsParam(values: Record<string, unknown>, params: URLSearchParams, key: string) {
  const value = values[key] as string[]
  if (!value) {
    return
  }

  params.set(key, value.join(','))
}

//

export function asSearchParams(
  values: Record<string, unknown>,
  paramsBuilder: (values: Record<string, unknown>, params: URLSearchParams) => void,
): string {
  const params = new URLSearchParams()
  paramsBuilder(values, params)
  const qs = params.toString()

  return qs ? `?${qs}` : ''
}

export function useFilterUrlSync(
  values: Record<string, unknown>,
  paramsBuilder: (values: Record<string, unknown>, params: URLSearchParams) => void,
) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const searchParams = asSearchParams(values, paramsBuilder)
    router.replace(`${pathname}${searchParams}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)])
}
