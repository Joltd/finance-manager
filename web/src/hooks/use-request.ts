import { useState } from "react";
import api from "@/lib/axios";

export interface RequestOptions {
  method?: string
  multipart?: boolean
}

export const useRequest = (path: string, options?: RequestOptions) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (data: Record<string, any>) => {
    setLoading(true)
    setError('')
    try {
      const response = await api({
        method: options?.method || 'POST',
        url: path,
        data: data,
        headers: options?.multipart
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined
      })
      if (response.status !== 200) {
        setError('Something wrong')
      } else if (!response.data.success) {
        setError(response.data.error)
      } else {
        return response.data.body
      }

      return null
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Something wrong')
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
    reset
  }
}