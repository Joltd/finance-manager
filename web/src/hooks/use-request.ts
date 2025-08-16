import { useState } from 'react'
import api from '@/lib/axios'
import { fillPathParams } from '@/lib/utils'
import { toast } from 'sonner'

export interface RequestOptions {
  method?: string
  multipart?: boolean
}

export const useRequest = (path: string, options?: RequestOptions) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onError = (error: string) => {
    toast(error)
    setError(error)
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
      if (response.status !== 200) {
        onError('Something wrong')
      } else if (!response.data.success) {
        onError(response.data.error)
      } else {
        return response.data.body
      }
    } catch (e: any) {
      onError(e?.message || 'Something wrong')
      throw e
    } finally {
      setLoading(false)
    }

    throw new Error(error)
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
