import { useState, useCallback } from 'react'
import { Method } from 'axios'
import api from '@/lib/axios'
import { buildPath } from '@/lib/api'

export interface UseRequestOptions {
  method?: Method
  multipart?: boolean
}

interface ApiResponse<TData> {
  body: TData
  success: boolean
  error: string
}

export interface SubmitRequest<TBody, TQuery, TPath> {
  body?: TBody
  queryParams?: TQuery
  pathParams?: TPath
}

interface UseRequestReturn<TData, TBody, TQuery, TPath> {
  loading: boolean
  error: string | null
  reset: () => void
  submit: (request?: SubmitRequest<TBody, TQuery, TPath>) => Promise<TData>
}

export function useRequest<
  TData = unknown,
  TBody = unknown,
  TQuery = unknown,
  TPath extends Record<string, string> = Record<string, string>,
>(path: string, options?: UseRequestOptions): UseRequestReturn<TData, TBody, TQuery, TPath> {
  const { method = 'POST', multipart = false } = options ?? {}

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  const submit = useCallback(
    async (request?: SubmitRequest<TBody, TQuery, TPath>): Promise<TData> => {
      const url = buildPath(path, request?.pathParams as Record<string, string> | undefined)
      setLoading(true)
      setError(null)
      try {
        const response = await api.request<ApiResponse<TData>>({
          url,
          method,
          data: request?.body,
          params: request?.queryParams,
          headers: multipart ? { 'Content-Type': 'multipart/form-data' } : undefined,
        })
        if (!response.data.success) {
          throw new Error(response.data.error)
        }
        return response.data.body
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [path, method, multipart],
  )

  return { loading, error, reset, submit }
}