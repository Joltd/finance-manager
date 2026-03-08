import React from 'react'
import { UserLoader } from '@/components/user/user-loader'
import { AskDialog } from '@/components/common/ask-dialog'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserLoader>
      <SidebarProvider className="h-full">
        {children}
      </SidebarProvider>
      <AskDialog />
    </UserLoader>
  )
}
