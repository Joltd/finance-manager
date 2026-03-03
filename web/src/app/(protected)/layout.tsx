import React from 'react'
import { UserLoader } from '@/components/user/user-loader'
import { AskDialog } from '@/components/common/ask-dialog'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserLoader>
      <main className="flex flex-col w-full h-full overflow-x-auto overflow-y-hidden relative">
        {children}
      </main>
      <AskDialog />
    </UserLoader>
  )
}
