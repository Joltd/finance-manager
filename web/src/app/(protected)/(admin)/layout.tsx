import React from 'react'
import { RoleGuard } from '@/components/user/role-guard'
import { SidebarInset } from '@/components/ui/sidebar'
import { AdminAppSidebar } from '@/components/common/sidebar/admin-app-sidebar'
import { MobileSidebarTrigger } from '@/components/common/sidebar/mobile-sidebar-trigger'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RoleGuard role="ADMIN">
      <AdminAppSidebar />
      <SidebarInset className="h-full overflow-hidden flex flex-col">
        <MobileSidebarTrigger />
        {children}
      </SidebarInset>
    </RoleGuard>
  )
}
