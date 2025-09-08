'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppearanceTrigger } from '@/components/ui/appearance-trigger'
import { PlusIcon, XIcon } from 'lucide-react'
import { useImportDataListStore } from '@/store/import-data'
import React, { useEffect } from 'react'
import {
  ImportDataNewDialog,
  useImportDataNewDialogStore,
} from '@/components/import-data/import-data-new-dialog'
import { useRequest } from '@/hooks/use-request'
import { importDataEvents, importDataUrls } from '@/api/import-data'
import { cn } from '@/lib/utils'
import { NotificationList } from '@/components/common/notification-list'
import { SettingDialog } from '@/components/setting/setting-dialog'
import { subscribeSse } from '@/lib/notification'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AppSidebar() {
  const { data, fetch } = useImportDataListStore('data', 'fetch') // todo support loadig, error
  const { open } = useImportDataNewDialogStore('open')
  const { submit } = useRequest(importDataUrls.id, { method: 'DELETE' })

  useEffect(() => {
    fetch()
    subscribeSse(importDataEvents.root, {}, () => fetch())
  }, [])

  const handleNewImport = () => {
    open()
  }

  const handleDelete = async (id: string) => {
    await submit({}, { id })
    fetch()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center">
        <SidebarTrigger />
        <a href="/" className={cn('text-lg text-nowrap overflow-hidden')}>
          Finance manager
        </a>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <a href={`/account`}>Account</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <a href={`/operation`}>Operation</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <a href={`/reference`}>Reference</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Reports</SidebarMenuButton>
                  </SidebarMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    <a href={'/report/top-flow'}>Top flow</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href={'/report/expense-income'}>Expense income</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Import</SidebarGroupLabel>
          <SidebarGroupAction onClick={handleNewImport}>
            <PlusIcon />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {data?.map((it) => (
                <SidebarMenuItem key={it.id}>
                  <SidebarMenuButton asChild>
                    <a href={`/import-data/${it.id}`}>
                      <span>{it.name}</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuAction showOnHover onClick={() => handleDelete(it.id)}>
                    <XIcon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <ImportDataNewDialog />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div>
          <AppearanceTrigger />
          <NotificationList />
          <SettingDialog />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
