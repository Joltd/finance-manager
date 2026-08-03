'use client'

import { useEffect, useState } from 'react'
import { format, isBefore, parseISO, subWeeks } from 'date-fns'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { useAccountBalanceStore } from '@/store/account'
import { AmountLabel } from '@/components/common/typography/amount-label'
import type { AccountBalance, AccountBalanceFilter } from '@/types/account'
import { Layout } from '@/components/common/layout/layout'
import { Typography } from '@/components/common/typography/typography'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Filter } from '@/components/common/filter/filter'
import { TextFilter } from '@/components/common/filter/text-filter'
import { BoolFilter } from '@/components/common/filter/bool-filter'
import { cn } from '@/lib/utils'
import { useRequest } from '@/hooks/use-request'
import { useSse } from '@/hooks/use-sse'
import { accountUrls, balanceChannels } from '@/api/account'
import { AccountSheet, openAccountSheet } from './account-sheet'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

function toQuery(filterValue: Record<string, unknown>): AccountBalanceFilter {
  return {
    name: filterValue.name as string | undefined,
    showDeleted: Boolean(filterValue.showDeleted),
  }
}

export default function AccountPage() {
  const store = useAccountBalanceStore()
  const deleteAccount = useRequest(accountUrls.id, { method: 'DELETE' })
  const [filterValue, setFilterValue] = useState<Record<string, unknown>>({})

  useEffect(() => {
    store.setQueryParams(toQuery(filterValue))
    void store.fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue])

  useSse(balanceChannels.balance, () => {
    void store.fetch()
  })

  const handleAddAccount = () => {
    openAccountSheet()
  }

  const handleEditAccount = (accountId: string) => {
    openAccountSheet(accountId)
  }

  const handleDeleteAccount = async (accountId: string) => {
    await deleteAccount.submit({ pathParams: { id: accountId } })
    void store.fetch()
  }

  return (
    <Layout scrollable>
      <AccountSheet />

      <Stack orientation="horizontal" gap={2}>
        <Typography variant="h3" className="grow">
          Accounts
        </Typography>
        <Button size="sm" onClick={handleAddAccount}>
          <PlusIcon />
          Account
        </Button>
      </Stack>

      <Filter value={filterValue} onChange={setFilterValue}>
        <TextFilter id="name" label="Name" />
        <BoolFilter id="showDeleted" label="Show deleted" />
      </Filter>

      <Stack gap={3} className="w-full max-w-2xl self-center">
        {store.loading && !store.data ? (
          <LoadingSkeleton />
        ) : store.data?.length ? (
          <Stack gap={0}>
            {store.data.map((entry) => (
              <AccountRow
                key={entry.account.id}
                entry={entry}
                onEdit={handleEditAccount}
                onDelete={(a) => void handleDeleteAccount(a)}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="muted">No accounts found</Typography>
        )}
      </Stack>
    </Layout>
  )
}

interface AccountRowProps {
  entry: AccountBalance
  onEdit: (accountId: string) => void
  onDelete: (accountId: string) => void
}

function AccountRow({ entry, onEdit, onDelete }: AccountRowProps) {
  const { account, balances } = entry
  const deleted = account.deleted

  const overdueRevise =
    account.reviseDate && isBefore(parseISO(account.reviseDate), subWeeks(new Date(), 2))

  return (
    <Stack
      orientation="horizontal"
      align="center"
      gap={1}
      className="group/account flex-wrap py-2.5"
    >
      <Typography
        as="span"
        variant="small"
        className={cn(deleted && 'line-through text-muted-foreground')}
      >
        {account.name}
      </Typography>

      <Stack orientation="horizontal" gap={0}>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 w-5 h-5 group-hover/account:opacity-100 transition-opacity"
          onClick={() => onEdit(account.id!)}
        >
          <PencilIcon className="w-3! h-3!" />
        </Button>
        {!deleted && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 w-5 h-5 group-hover/account:opacity-100 transition-opacity text-destructive hover:text-destructive"
            onClick={() => onDelete(account.id!)}
          >
            <Trash2Icon className="w-3! h-3!" />
          </Button>
        )}
      </Stack>

      <div className="grow" />

      {overdueRevise && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline">Revise</Badge>
          </TooltipTrigger>
          <TooltipContent>
            Last revised: {format(parseISO(account.reviseDate!), 'dd MMM yyyy')}
          </TooltipContent>
        </Tooltip>
      )}

      <Flow
        gap={2}
        keepWhenEmpty
        className="basis-full justify-end min-h-5 md:basis-auto md:min-h-0"
      >
        {balances.map((a) => (
          <AmountLabel key={a.currency} amount={a} />
        ))}
      </Flow>
    </Stack>
  )
}

function LoadingSkeleton() {
  return (
    <Stack gap={0}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Stack key={i} orientation="horizontal" align="center" gap={1} className="py-2.5">
          <Skeleton className="h-4 w-40 grow" />
          <Flow gap={2}>
            <Skeleton className="h-4 w-16" />
          </Flow>
        </Stack>
      ))}
    </Stack>
  )
}
