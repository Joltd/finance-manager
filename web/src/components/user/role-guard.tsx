'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import type { UserRole } from '@/types/user'

const HOME_BY_ROLE: Record<UserRole, string> = {
  USER: '/',
  ADMIN: '/admin',
}

interface RoleGuardProps {
  role: UserRole
  children: React.ReactNode
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const router = useRouter()
  const user = useUserStore((state) => state.data)

  useEffect(() => {
    if (user && user.role !== role) {
      router.replace(HOME_BY_ROLE[user.role])
    }
  }, [user, role, router])

  if (!user || user.role !== role) {
    return null
  }

  return <>{children}</>
}