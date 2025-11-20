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
  useSidebar,
} from '@/components/ui/sidebar'
import {
  BookTextIcon,
  HandCoinsIcon,
  ListChecksIcon,
  PlusIcon,
  ScrollTextIcon,
  WalletIcon,
  XIcon,
} from 'lucide-react'
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
  const importDataList = useImportDataListStore('data', 'fetch') // todo support loadig, error
  const importDataNewDialog = useImportDataNewDialogStore('open')
  const importDataDelete = useRequest(importDataUrls.id, { method: 'DELETE' })
  const { open } = useSidebar()

  useEffect(() => {
    importDataList.fetch()
  }, [])

  const handleNewImport = () => {
    importDataNewDialog.open()
  }

  const handleDelete = async (id: string) => {
    await importDataDelete.submit({}, { id })
  }

  return (
    <AppSidebar>
      <Sse eventName={importDataEvents.root} listener={importDataList.fetch} />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/account">
                    <WalletIcon />
                    <span>Account</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/operation">
                    <HandCoinsIcon />
                    <span>Operation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/reference">
                    <BookTextIcon />
                    <span>Reference</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Report</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`/report/income-expense`}>
                    <ListChecksIcon />
                    <span>Income vs expense</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`/report/top-flow`}>
                    <ScrollTextIcon />
                    <span>Top flow</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="overflow-x-hidden hidden md:flex">
          <SidebarGroupLabel>Import</SidebarGroupLabel>
          <SidebarGroupAction onClick={handleNewImport}>
            <PlusIcon />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {open &&
                importDataList.data?.map((it) => (
                  <SidebarMenuItem key={it.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/import-data/${it.id}`}>
                        <span>{it.name}</span>
                      </Link>
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
