import { useEffect, useRef, useState } from 'react'
import { useRequest } from '@/hooks/use-request'

interface ReferenceLike {
  id?: string
}

export function useReferenceCache<T extends ReferenceLike>(url: string, ids: string[]) {
  const resolveReq = useRequest<T[], unknown, { ids: string }>(url, { method: 'GET' })
  const [resolved, setResolved] = useState<Record<string, T>>({})
  const pendingRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const missing = ids.filter((id) => !resolved[id] && !pendingRef.current.has(id))
    if (missing.length === 0) return
    missing.forEach((id) => pendingRef.current.add(id))
    void resolveReq.submit({ queryParams: { ids: missing.join(',') } }).then((data) => {
      setResolved((prev) => {
        const next = { ...prev }
        for (const item of data) if (item.id) next[item.id] = item
        return next
      })
      missing.forEach((id) => pendingRef.current.delete(id))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')])

  const cache = (item: T) => {
    if (!item.id) return
    setResolved((prev) => ({ ...prev, [item.id!]: item }))
  }

  return { resolved, cache }
}
