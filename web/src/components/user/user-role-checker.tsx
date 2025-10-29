'use client'
import React, { useEffect, useState } from 'react'
import { useUserStore } from '@/store/user'
import { UserRole } from '@/types/user'
import { useRouter } from 'next/navigation'
import { homes } from '@/app/(protected)/routes'

export interface UserRoleCheckerProps {
  role: UserRole
  children?: React.ReactNode
}

export function UserRoleChecker({ role, children }: UserRoleCheckerProps) {
  const { data } = useUserStore('data')
  const router = useRouter()

  useEffect(() => {
    if (!!data?.role && data?.role !== role) {
      const home = homes[data?.role]
      router.push(home)
    }
  }, [data?.role])

  return data?.role === role && children
}
