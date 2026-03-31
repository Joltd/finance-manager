'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowLeftRight,
  ArrowUpDown,
  BookOpen,
  Tags,
  PlusIcon,
  Trash2Icon,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useEffect } from 'react'
import {
  Sidebar,
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
import { SidebarAppHeader } from './sidebar-app-header'
import { SidebarUserFooter } from './sidebar-user-footer'
import { useImportDataListStore } from '@/store/import-data'
import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'
import { openImportDataBeginDialog } from '@/app/(protected)/(user)/import-data/[id]/import-data-begin-dialog'
import { Reference } from '@/types/common/reference'

const mainNav = [
  { href: '/operation', label: 'Operations', icon: ArrowLeftRight },
  { href: '/account', label: 'Accounts', icon: Wallet },
  { href: '/reference', label: 'Reference', icon: BookOpen },
]

const reportsNav = [
  { href: '/report/income-expense', label: 'Income & Expense', icon: TrendingUp },
  { href: '/report/top-flow', label: 'Top Flow', icon: ArrowUpDown },
  { href: '/report/tagged-flow', label: 'Tagged Flow', icon: Tags },
]

export function UserAppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()
  const importDataList = useImportDataListStore()
  const deleteImport = useRequest(importDataUrls.id, { method: 'DELETE' })

  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  useEffect(() => {
    void importDataList.fetch()
  }, [importDataList.fetch])

  const handleDelete = async (item: Reference) => {
    await deleteImport.submit({ pathParams: { id: item.id } })
    if (pathname === `/import-data/${item.id}`) {
      router.push('/')
    }
    void importDataList.fetch()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarAppHeader homeHref="/" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href} tooltip={label}>
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsNav.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href} tooltip={label}>
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="hidden md:block">
          <SidebarGroupLabel>Import Data</SidebarGroupLabel>
          <SidebarGroupAction title="New import" onClick={openImportDataBeginDialog}>
            <PlusIcon />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {importDataList.data?.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/import-data/${item.id}`}
                    tooltip={item.name}
                  >
                    <Link href={`/import-data/${item.id}`}>
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    showOnHover
                    title="Delete import"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2Icon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarUserFooter />
    </Sidebar>
  )
}
