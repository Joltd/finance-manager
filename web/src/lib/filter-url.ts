'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'

export function setNumberParam(params: URLSearchParams, key: string, value?: number) {
  if (!value) {
    return
  }

  params.set(key, value.toString())
}

export function setDateParam(params: URLSearchParams, key: string, value?: Date) {
  if (!value) {
    return
  }

  params.set(key, format(value, 'yyyy-MM-dd'))
}

export function setIdsParam(params: URLSearchParams, key: string, value?: unknown) {
  if (!value) {
    return
  }

  const ids = value as string[]
  params.set(key, ids.join(','))
}

export function setParam(params: URLSearchParams, key: string, value?: unknown) {
  if (!value) {
    return
  }

  params.set(key, value as string)
}

export function paramToIds(raw: string | null): string[] | undefined {
  if (!raw) return undefined
  const ids = raw.split(',').filter(Boolean)
  return ids.length > 0 ? ids : undefined
}

export function paramToDate(raw: string | null): Date | undefined {
  return raw ? parseISO(raw) : undefined
}

/**
 * Keeps the current URL's query string in sync with filterValue, so a page's
 * filter state survives a remount (e.g. navigating away and back via browser history).
 */
export function useFilterUrlSync(
  filterValue: Record<string, unknown>,
  toParams: (value: Record<string, unknown>) => URLSearchParams,
) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const qs = toParams(filterValue).toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filterValue)])
}
