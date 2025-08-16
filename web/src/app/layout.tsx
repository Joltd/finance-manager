import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/common/app-sidebar'
import { AskTextDialog } from '@/components/common/ask-text-dialog'
import { ActionBarContainer } from '@/components/common/action-bar'
import React from 'react'
import { CurrencyInitialFetcher } from '@/components/account/currency-initial-fetcher'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Finance Manager',
  description: 'Management application for personal finances',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="w-full h-full overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full h-full overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider className="h-full">
            <CurrencyInitialFetcher />
            <AppSidebar />
            <main className="flex flex-col w-full h-full overflow-x-auto overflow-y-hidden relative">
              {children}
              <ActionBarContainer />
            </main>
            <AskTextDialog />
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
