'use client'

import { type MouseEvent } from 'react'
import Link from 'next/link'
import {
  SidebarHeader,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { useUserStore } from '@/store/user'
import { buildCurrencyIconSvg } from '@/lib/currency-icon'

interface SidebarAppHeaderProps {
  homeHref: string
}

export function SidebarAppHeader({ homeHref }: SidebarAppHeaderProps) {
  const { state, toggleSidebar } = useSidebar()
  const currency = useUserStore((s) => s.data?.settings.operationDefaultCurrency)
  const iconSrc = buildCurrencyIconSvg(currency)

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
            <img
              src={iconSrc}
              alt={currency ?? 'USD'}
              className="size-8 shrink-0"
            />
            <span className="font-semibold">Finance Manager</span>
          </Link>
        </SidebarMenuButton>
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden shrink-0 hidden md:flex" />
      </div>
    </SidebarHeader>
  )
}
