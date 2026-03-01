import React from 'react'
import { RoleGuard } from '@/components/user/role-guard'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RoleGuard role="ADMIN">{children}</RoleGuard>
}