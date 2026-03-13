import React from 'react'
import { UserLoader } from '@/components/user/user-loader'
import { AskDialog } from '@/components/common/ask-dialog'
import { ImportDataBeginDialog } from '@/app/(protected)/(user)/import-data/[id]/import-data-begin-dialog'
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
      <ImportDataBeginDialog />
    </UserLoader>
  )
}
