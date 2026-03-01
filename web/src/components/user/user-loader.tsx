'use client'

import React, { useEffect } from 'react'
import { useUserStore } from '@/store/user'
import { Spinner } from '@/components/ui/spinner'

export function UserLoader({ children }: { children: React.ReactNode }) {
  const { data, fetch } = useUserStore()

  useEffect(() => {
    fetch()
  }, [fetch])

  if (!data) {
    return <Spinner className="size-8" />
  }

  return <>{children}</>
}
