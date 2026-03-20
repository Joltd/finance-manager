'use client'

import { MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'

export function MobileSidebarTrigger() {
  const { toggleSidebar } = useSidebar()

  return (
    <div className="flex md:hidden items-center px-2 py-1.5 border-b shrink-0">
      <Button variant="ghost" size="icon" className="size-8" onClick={toggleSidebar}>
        <MenuIcon className="size-4" />
      </Button>
    </div>
  )
}