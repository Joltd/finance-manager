'use client'
import { useAccountBalanceStore } from '@/store/account'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircleIcon, ListFilterPlusIcon, PlusIcon } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
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
    return subscribeSse(accountEvents.balance, {}, () => accountBalance.fetch())
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
    <>
      {accountBalance.loading && !accountBalance.dataFetched ? (
        <Spinner className="m-6" />
      ) : accountBalance.error ? (
        <Alert variant="destructive" className="m-6">
          <AlertCircleIcon />
          <AlertTitle>{accountBalance.error}</AlertTitle>
        </Alert>
      ) : accountBalance.data ? (
        <>
          <div className="relative flex flex-col gap-12 p-6 overflow-y-auto">
            {accountBalance.data?.map((group) => (
              <div key={group.id} className="flex flex-col gap-4">
                <TextLabel variant="title">
                  {group.name || <EmptyLabel>No group</EmptyLabel>}
                </TextLabel>
                <div className="flex flex-wrap gap-4">
                  {group.accounts?.map((account) => (
                    <AccountBalanceCard
                      key={account.id}
                      id={account.id}
                      name={account.name}
                      balances={account.balances}
                      onClick={() => accountSheet.openWith(account.id)}
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
        </>
      ) : null}
    </>
  )
}
