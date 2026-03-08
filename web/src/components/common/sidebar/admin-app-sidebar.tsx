'use client'

import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { SidebarAppHeader } from './sidebar-app-header'
import { SidebarUserFooter } from './sidebar-user-footer'

export function AdminAppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarAppHeader homeHref="/admin" />
      <SidebarContent />
      <SidebarUserFooter />
    </Sidebar>
  )
}
