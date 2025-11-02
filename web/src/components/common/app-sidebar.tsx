'use client'
import React, { useEffect, useState } from 'react'
import { Portal } from '@radix-ui/react-portal'
import { useUserStore } from '@/store/user'
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { firstLetters } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOutIcon, SettingsIcon, XIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useUserSheetStore } from '@/components/user/user-sheet'
import { UserRole } from '@/types/user'
import { resetFetchStores } from '@/store/common/fetch'
import Link from 'next/link'
import { Typography } from '@/components/common/typography/typography'
import { useHome } from '@/hooks/use-home'
import { useIsMobile } from '@/hooks/use-mobile'

const ID = 'app-sidebar'

export interface AppSidebarProps {
  children: React.ReactNode
}

export function AppSidebar({ children }: AppSidebarProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const user = useUserStore('data')
  const userSheet = useUserSheetStore('open')
  const router = useRouter()
  const { home } = useHome()
  const { open, openMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()

  useEffect(() => {
    setContainer(document.getElementById(ID))
  }, [])

  useEffect(() => {
    if (openMobile) {
      setOpenMobile(false)
    }
  }, [pathname])

  const handleSettings = () => {
    userSheet.open()
  }

  const handleLogout = async () => {
    await fetch('/api/logout')
    resetFetchStores()
    router.push('/login')
  }

  return (
    <Portal container={container}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex flex-row items-center">
            <SidebarTrigger />
            {open && (
              <Link href={home}>
                <Typography variant="h4" as="span" className="whitespace-nowrap">
                  Finance manager
                </Typography>
              </Link>
            )}
          </div>
        </SidebarHeader>
        {children}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <Avatar className="ml-[-8px]">
                      <AvatarFallback>{firstLetters(user.data?.name || 'User')}</AvatarFallback>
                    </Avatar>
                    <span>{user.data?.name}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {user.data?.role === UserRole.USER && (
                    <DropdownMenuItem onClick={handleSettings}>
                      <SettingsIcon />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOutIcon />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </Portal>
  )
}

export function AppSidebarContainer() {
  return <div id={ID} />
}
