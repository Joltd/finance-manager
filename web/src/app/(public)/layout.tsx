import React from 'react'
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex flex-col w-full h-full justify-center items-center overflow-x-auto overflow-y-hidden relative">
      {children}
      <Toaster />
    </main>
  )
}
