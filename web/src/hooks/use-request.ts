import { useState } from 'react'
import api from '@/lib/axios'
import { fillPathParams } from '@/lib/utils'
import { toast } from 'sonner'

export interface RequestOptions {
  method?: string
  multipart?: boolean
  noErrorToast?: boolean
}

export const useRequest = (path: string, options?: RequestOptions) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleError = (error: string) => {
    if (!options?.noErrorToast) {
      toast(error) // todo link to notification list
    }
    setError(error)
    return Promise.reject(error)
  }

  const submit = async (data: Record<string, any>, pathParams?: Record<string, any>) => {
    setLoading(true)
    setError('')
    try {
      const preparedPath = fillPathParams(path, pathParams)
      const response = await api({
        method: options?.method || 'POST',
        url: preparedPath,
        data: data,
        headers: options?.multipart ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      if (response.status !== 200 || !response.data.success) {
        return handleError(response.data.error || 'Something wrong')
      } else {
        return response.data.body
      }
    } catch (error: any) {
      return handleError(error.response.data.error || 'Something wrong')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setLoading(false)
    setError('')
  }

  return {
    loading,
    error,
    submit,
    reset,
  }
}
