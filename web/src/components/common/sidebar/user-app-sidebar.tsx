'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeftRight, ArrowUpDown, BookOpen, PlusIcon, TrendingUp, Wallet } from 'lucide-react'
import { useEffect } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { SidebarAppHeader } from './sidebar-app-header'
import { SidebarUserFooter } from './sidebar-user-footer'
import { useImportDataListStore } from '@/store/import-data'

const mainNav = [
  { href: '/operation', label: 'Operations', icon: ArrowLeftRight },
  { href: '/account', label: 'Accounts', icon: Wallet },
]

const reportsNav = [
  { href: '/report/income-expense', label: 'Income & Expense', icon: TrendingUp },
  { href: '/report/top-flow', label: 'Top Flow', icon: ArrowUpDown },
]

const settingsNav = [
  { href: '/reference', label: 'Reference', icon: BookOpen },
]

export function UserAppSidebar() {
  const pathname = usePathname()
  const importDataList = useImportDataListStore()

  useEffect(() => {
    void importDataList.fetch()
  }, [importDataList.fetch])

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

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNav.map(({ href, label, icon: Icon }) => (
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
          <SidebarGroupLabel>Import Data</SidebarGroupLabel>
          <SidebarGroupAction title="New import">
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
