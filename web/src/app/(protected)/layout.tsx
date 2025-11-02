import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebarContainer } from '@/components/common/app-sidebar'
import { AskTextDialog } from '@/components/common/ask-text-dialog'
import { ActionBarContainer } from '@/components/common/action-bar'
import React from 'react'
import { UserAuthentication } from '@/components/user/user-authentication'
import { UserSheet } from '@/components/user/user-sheet'
import { Typography } from '@/components/common/typography/typography'
import { Stack } from '@/components/common/layout/stack'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserAuthentication>
      <SidebarProvider className="h-full">
        <AppSidebarContainer />
        <main className="flex flex-col w-full h-full overflow-x-auto overflow-y-hidden relative">
          <Stack orientation="horizontal" className="md:hidden items-center">
            <SidebarTrigger className="size-12" />
            <Typography variant="h4">Finance manager</Typography>
          </Stack>
          {children}
          <ActionBarContainer />
          <UserSheet />
        </main>
        <AskTextDialog />
      </SidebarProvider>
    </UserAuthentication>
  )
}
