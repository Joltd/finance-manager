'use client'
import { useAccountBalanceStore } from '@/store/account'
import { ListFilterPlusIcon, PlusIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import { AccountBalanceCard } from '@/components/account/account-balance-card'
import { useAccountSheetStore } from '@/components/account/account-sheet'
import { subscribeSse } from '@/lib/notification'
import { accountEvents } from '@/api/account'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Layout } from '@/components/common/layout/layout'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Section, SectionHeader } from '@/components/common/layout/section'
import { ResponsiveButton } from '@/components/common/responsive-button'
import { Flow } from '@/components/common/layout/flow'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { Stack } from '@/components/common/layout/stack'

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
    <Layout scrollable>
      <SectionHeader
        text="Account"
        actions={
          <>
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
            <ResponsiveButton
              size="sm"
              label="Add account"
              icon={<PlusIcon />}
              onClick={handleAddAccount}
            />
          </>
        }
      />
      <DataPlaceholder {...accountBalance}>
        <Stack gap={6}>
          {accountBalance.data?.map((group, index) => (
            <Group
              key={group.id || 'empty'}
              text={group.name || <Typography variant="muted">No group</Typography>}
            >
              <Flow gap={4}>
                {group.accounts?.map((it) => (
                  <AccountBalanceCard
                    key={it.account.id}
                    account={it.account}
                    balances={it.balances}
                    onClick={() => accountSheet.openWith(it.account.id)}
                  />
                ))}
              </Flow>
            </Group>
          ))}
        </Stack>
      </DataPlaceholder>
    </Layout>
  )
}
