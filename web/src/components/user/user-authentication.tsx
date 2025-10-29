'use client'

import { useUserStore } from '@/store/user'
import React, { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'

export interface UserAuthenticationProps {
  children?: React.ReactNode
}

export function UserAuthentication({ children }: UserAuthenticationProps) {
  const user = useUserStore('loading', 'dataFetched', 'fetch', 'data')

  useEffect(() => {
    if (!user.dataFetched) {
      user.fetch()
    }
  }, [])

  return user.loading && !user.dataFetched ? <Spinner className="m-4" /> : !!user.data && children
}
