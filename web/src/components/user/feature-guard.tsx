'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { useSettingsFlag } from '@/hooks/use-settings-flag'
import type { Settings } from '@/types/user'

interface FeatureGuardProps {
  flag: keyof Settings
  children: React.ReactNode
}

export function FeatureGuard({ flag, children }: FeatureGuardProps) {
  const router = useRouter()
  const loaded = useUserStore((state) => !!state.data)
  const enabled = useSettingsFlag(flag)

  useEffect(() => {
    if (loaded && !enabled) {
      router.replace('/')
    }
  }, [loaded, enabled, router])

  if (!loaded || !enabled) {
    return null
  }

  return <>{children}</>
}
