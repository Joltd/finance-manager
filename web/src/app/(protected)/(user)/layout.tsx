import React from 'react'
import { RoleGuard } from '@/components/user/role-guard'
import { SidebarInset } from '@/components/ui/sidebar'
import { UserAppSidebar } from '@/components/common/sidebar/user-app-sidebar'

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RoleGuard role="USER">
      <UserAppSidebar />
      <SidebarInset className="h-full overflow-hidden">
        {children}
      </SidebarInset>
    </RoleGuard>
  )
}
