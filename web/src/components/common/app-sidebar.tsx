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
import { useEffect } from 'react'
import {
  ImportDataNewDialog,
  useImportDataNewDialogStore,
} from '@/components/import-data/import-data-new-dialog'
import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const { data, fetch } = useImportDataListStore('data', 'fetch')
  const { open } = useImportDataNewDialogStore('open')
  const { submit } = useRequest(importDataUrls.id, { method: 'DELETE' })

  useEffect(() => {
    fetch()
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
        <AppearanceTrigger />
      </SidebarFooter>
    </Sidebar>
  )
}
