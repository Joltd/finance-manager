import React from 'react'
import { AdminAppSidebar } from '@/components/user/admin-app-sidebar'
import { UserRoleChecker } from '@/components/user/user-role-checker'
import { UserRole } from '@/types/user'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserRoleChecker role={UserRole.ADMIN}>
      <AdminAppSidebar />
      {children}
    </UserRoleChecker>
  )
}
