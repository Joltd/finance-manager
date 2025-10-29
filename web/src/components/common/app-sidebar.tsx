'use client'
import React, { useEffect, useState } from 'react'
import { Portal } from '@radix-ui/react-portal'
import { useUserStore } from '@/store/user'
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { cn, firstLetters } from '@/lib/utils'
import { homes } from '@/app/(protected)/routes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOutIcon, SettingsIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUserSheetStore } from '@/components/user/user-sheet'
import { UserRole } from '@/types/user'
import { resetFetchStores } from '@/store/common/fetch'

const ID = 'app-sidebar'

export interface AppSidebarProps {
  children: React.ReactNode
}

export function AppSidebar({ children }: AppSidebarProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const user = useUserStore('data')
  const userSheet = useUserSheetStore('open')
  const router = useRouter()

  useEffect(() => {
    setContainer(document.getElementById(ID))
  }, [])

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
        <SidebarHeader className="flex-row items-center">
          <SidebarTrigger />
          <a
            href={user.data?.role ? homes[user.data?.role] : '#'}
            className={cn('text-lg text-nowrap overflow-hidden')}
          >
            Finance manager
          </a>
        </SidebarHeader>
        {children}
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Avatar>
                    <AvatarFallback>{firstLetters(user.data?.name || 'User')}</AvatarFallback>
                  </Avatar>
                  {user.data?.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {user.data?.role === UserRole.USER && (
                <DropdownMenuItem onClick={handleSettings}>
                  <SettingsIcon />
                  Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
    </Portal>
  )
}

export function AppSidebarContainer() {
  return <div id={ID} />
}
