import React from 'react'
import { RoleGuard } from '@/components/user/role-guard'
import { SidebarInset } from '@/components/ui/sidebar'
import { AdminAppSidebar } from '@/components/common/sidebar/admin-app-sidebar'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RoleGuard role="ADMIN">
      <AdminAppSidebar />
      <SidebarInset className="h-full overflow-hidden">
        {children}
      </SidebarInset>
    </RoleGuard>
  )
}
