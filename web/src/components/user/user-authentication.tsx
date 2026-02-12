'use client'

import { useUserStore } from '@/store/user'
import React, { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import api from '@/lib/axios'
import { useSseStore } from '@/components/sse'

export interface UserAuthenticationProps {
  children?: React.ReactNode
}

export function UserAuthentication({ children }: UserAuthenticationProps) {
  const user = useUserStore('loading', 'dataFetched', 'fetch', 'data')
  const store = useSseStore()

  useEffect(() => {
    if (!user.dataFetched) {
      user.fetch()
    }
    if (!store.source) {
      api.get('/api/sse-endpoint').then((response) => {
        store.initSource(response.data)
      })
    }
  }, [])

  return (user.loading && !user.dataFetched) || !store.source ? (
    <Spinner className="m-4" />
  ) : (
    !!user.data && children
  )
}
