import { useCallback, useState } from 'react'
import { Method } from 'axios'
import { toast } from 'sonner'
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
  data?: TData
  loading: boolean
  error?: string
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

  const [data, setData] = useState<TData | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const reset = useCallback(() => {
    setData(undefined)
    setLoading(false)
    setError(undefined)
  }, [])

  const submit = useCallback(
    async (request?: SubmitRequest<TBody, TQuery, TPath>): Promise<TData> => {
      const url = buildPath(path, request?.pathParams as Record<string, string> | undefined)
      setLoading(true)
      setError(undefined)
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
        setData(response.data.body)
        return response.data.body
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        toast.error(message)
        console.error(err)
        return Promise.reject(err)
      } finally {
        setLoading(false)
      }
    },
    [path, method, multipart],
  )

  return { data, loading, error, reset, submit }
}
