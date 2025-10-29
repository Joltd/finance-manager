import React from 'react'
import { UserAppSidebar } from '@/components/user/user-app-sidebar'
import { UserRoleChecker } from '@/components/user/user-role-checker'
import { UserRole } from '@/types/user'
import { CurrencyInitialFetcher } from '@/components/account/currency-initial-fetcher'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserRoleChecker role={UserRole.USER}>
      <CurrencyInitialFetcher />
      <UserAppSidebar />
      {children}
    </UserRoleChecker>
  )
}
