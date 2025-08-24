'use client'
import { useAccountBalanceStore } from '@/store/account'
import { ListFilterPlusIcon, PlusIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import { AccountBalanceCard } from '@/components/account/account-balance-card'
import { TextLabel } from '@/components/common/text-label'
import { EmptyLabel } from '@/components/common/empty-label'
import { AccountSheet, useAccountSheetStore } from '@/components/account/account-sheet'
import { subscribeSse } from '@/lib/notification'
import { accountEvents } from '@/api/account'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataSection } from '@/components/common/data-section'

export default function Page() {
  const accountBalance = useAccountBalanceStore(
    'loading',
    'dataFetched',
    'error',
    'data',
    'fetch',
    'queryParams',
    'setQueryParams',
  )
  const accountSheet = useAccountSheetStore('openWith')

  useEffect(() => {
    accountBalance.setQueryParams({ hideZeroBalances: true })
    accountBalance.fetch()
    return subscribeSse(accountEvents.root, {}, () => accountBalance.fetch())
  }, [])

  const handleToggleZeroBalances = () => {
    accountBalance.setQueryParams({
      hideZeroBalances: !accountBalance.queryParams?.hideZeroBalances,
    })
    accountBalance.fetch()
  }

  const handleAddAccount = () => {
    accountSheet.openWith()
  }

  return (
    <DataSection store={accountBalance}>
      <div className="relative flex flex-col gap-12 p-6 overflow-y-auto">
        {accountBalance.data?.map((group) => (
          <div key={group.id || 'empty'} className="flex flex-col gap-4">
            <TextLabel variant="title">{group.name || <EmptyLabel>No group</EmptyLabel>}</TextLabel>
            <div className="flex flex-wrap gap-4">
              {group.accounts?.map((it) => (
                <AccountBalanceCard
                  key={it.account.id}
                  account={it.account}
                  balances={it.balances}
                  onClick={() => accountSheet.openWith(it.account.id)}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="absolute top-6 right-6 flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <ListFilterPlusIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleToggleZeroBalances}>
                Toggle zero balances
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={handleAddAccount}>
            <PlusIcon />
            Add account
          </Button>
        </div>
      </div>
      <AccountSheet />
    </DataSection>
  )
}
