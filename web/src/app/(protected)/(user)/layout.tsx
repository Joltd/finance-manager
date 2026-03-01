import React from 'react'
import { RoleGuard } from '@/components/user/role-guard'

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RoleGuard role="USER">{children}</RoleGuard>
}