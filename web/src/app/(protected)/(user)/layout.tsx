import React from 'react'
import { RoleGuard } from '@/components/user/role-guard'
import { SidebarInset } from '@/components/ui/sidebar'
import { UserAppSidebar } from '@/components/common/sidebar/user-app-sidebar'
import { MobileSidebarTrigger } from '@/components/common/sidebar/mobile-sidebar-trigger'
import { AppFavicon } from '@/components/common/app-favicon'

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RoleGuard role="USER">
      <AppFavicon />
      <UserAppSidebar />
      <SidebarInset className="h-full overflow-hidden flex flex-col">
        <MobileSidebarTrigger />
        {children}
      </SidebarInset>
    </RoleGuard>
  )
}
