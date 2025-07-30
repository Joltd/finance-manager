import { useState } from 'react'
import api from '@/lib/axios'
import { fillPathParams } from '@/lib/utils'

export interface RequestOptions {
  method?: string
  multipart?: boolean
}

export const useRequest = (path: string, options?: RequestOptions) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        setError('Something wrong')
      } else if (!response.data.success) {
        setError(response.data.error)
      } else {
        return response.data.body
      }
    } catch (e: any) {
      setError(e?.message || 'Something wrong')
      throw e
    } finally {
      setLoading(false)
    }

    throw new Error()
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
