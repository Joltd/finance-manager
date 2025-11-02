'use client'
import React, { useEffect, useState } from 'react'
import { useUserStore } from '@/store/user'
import { UserRole } from '@/types/user'
import { useHome } from '@/hooks/use-home'

export interface UserRoleCheckerProps {
  role: UserRole
  children?: React.ReactNode
}

export function UserRoleChecker({ role, children }: UserRoleCheckerProps) {
  const { data } = useUserStore('data')
  const { redirect } = useHome()

  useEffect(() => {
    if (!!data?.role && data?.role !== role) {
      redirect()
    }
  }, [data?.role])

  return data?.role === role && children
}
