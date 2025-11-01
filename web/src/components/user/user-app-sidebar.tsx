'use client'
import { AppSidebar } from '@/components/common/app-sidebar'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { PlusIcon, XIcon } from 'lucide-react'
import {
  ImportDataNewDialog,
  useImportDataNewDialogStore,
} from '@/components/import-data/import-data-new-dialog'
import { useImportDataListStore } from '@/store/import-data'
import { useRequest } from '@/hooks/use-request'
import { importDataEvents, importDataUrls } from '@/api/import-data'
import { useEffect } from 'react'
import Link from 'next/link'
import { Sse } from '@/components/sse'

export function UserAppSidebar() {
  const { data, fetch } = useImportDataListStore('data', 'fetch') // todo support loadig, error
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
    <AppSidebar>
      <Sse eventName={importDataEvents.root} listener={fetch} />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/account">Account</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/operation">Operation</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/reference">Reference</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/*<DropdownMenu>*/}
              {/*  <DropdownMenuTrigger asChild>*/}
              {/*    <SidebarMenuItem>*/}
              {/*      <SidebarMenuButton>Reports</SidebarMenuButton>*/}
              {/*    </SidebarMenuItem>*/}
              {/*  </DropdownMenuTrigger>*/}
              {/*  <DropdownMenuContent align="start">*/}
              {/*    <DropdownMenuItem>*/}
              {/*      <a href={'/report/top-flow'}>Top flow</a>*/}
              {/*    </DropdownMenuItem>*/}
              {/*    <DropdownMenuItem>*/}
              {/*      <a href={'/report/expense-income'}>Expense income</a>*/}
              {/*    </DropdownMenuItem>*/}
              {/*  </DropdownMenuContent>*/}
              {/*</DropdownMenu>*/}
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
                    <Link href={`/import-data/${it.id}`}>{it.name}</Link>
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
    </AppSidebar>
  )
}
