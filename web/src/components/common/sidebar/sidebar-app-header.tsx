'use client'

import { type MouseEvent } from 'react'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { SidebarHeader, SidebarMenuButton, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'

interface SidebarAppHeaderProps {
  homeHref: string
}

export function SidebarAppHeader({ homeHref }: SidebarAppHeaderProps) {
  const { state, toggleSidebar } = useSidebar()

  const handleClick = (e: MouseEvent) => {
    if (state === 'collapsed') {
      e.preventDefault()
      toggleSidebar()
    }
  }

  return (
    <SidebarHeader>
      <div className="flex items-center gap-1">
        <SidebarMenuButton asChild size="lg" className="flex-1" tooltip="Expand">
          <Link href={homeHref} onClick={handleClick}>
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <LayoutDashboard className="size-4" />
            </div>
            <span className="font-semibold">Finance Manager</span>
          </Link>
        </SidebarMenuButton>
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden shrink-0 hidden md:flex" />
      </div>
    </SidebarHeader>
  )
}
