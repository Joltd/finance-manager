'use client'

import { useEffect } from 'react'
import { format, isBefore, parseISO, subWeeks } from 'date-fns'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { useAccountBalanceStore } from '@/store/account'
import { AmountLabel } from '@/components/common/typography/amount-label'
import type { AccountBalance, AccountBalanceGroup } from '@/types/account'
import { Layout } from '@/components/common/layout/layout'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useRequest } from '@/hooks/use-request'
import { accountUrls, groupUrls } from '@/api/account'
import { ask } from '@/store/common/ask-dialog'
import { AccountSheet, openAccountSheet } from './account-sheet'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

export default function AccountPage() {
  const store = useAccountBalanceStore()
  const saveGroup = useRequest(groupUrls.root)
  const deleteAccount = useRequest(accountUrls.id, { method: 'DELETE' })

  useEffect(() => {
    void store.fetch()
  }, [store.fetch])

  const handleAddGroup = async () => {
    const name = await ask({ type: 'string', label: 'Group name' })
    await saveGroup.submit({ body: { name } })
    void store.fetch()
  }

  const handleEditGroup = async (group: AccountBalanceGroup) => {
    const name = await ask({
      type: 'string',
      label: 'Group name',
      initialValue: group.name ?? undefined,
    })
    await saveGroup.submit({ body: { id: group.id, name } })
    void store.fetch()
  }

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
    <Layout>
      <AccountSheet />

      <Stack orientation="horizontal" gap={2}>
        <Typography variant="h3" className="grow">
          Accounts
        </Typography>
        <Button variant="outline" size="sm" onClick={() => void handleAddGroup()}>
          <PlusIcon />
          Group
        </Button>
        <Button size="sm" onClick={handleAddAccount}>
          <PlusIcon />
          Account
        </Button>
      </Stack>

      {store.loading ? (
        <LoadingSkeleton />
      ) : (
        <Stack scrollable gap={6}>
          {store.data?.map((group) => {
            const isUngrouped = !group.id
            const accounts =
              group.accounts.length === 0 ? (
                <Typography variant="muted" className="py-3">
                  No accounts in this group
                </Typography>
              ) : (
                group.accounts.map((entry) => (
                  <AccountRow
                    key={entry.account.id}
                    entry={entry}
                    onEdit={handleEditAccount}
                    onDelete={(a) => void handleDeleteAccount(a)}
                  />
                ))
              )

            if (isUngrouped) {
              return (
                <Group key="-" title="Ungrouped">
                  {accounts}
                </Group>
              )
            }

            return (
              <Group
                key={group.id}
                title={group.name}
                actions={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 w-5 h-5 group-hover/group:opacity-100 transition-opacity shrink-0"
                    onClick={() => void handleEditGroup(group)}
                  >
                    <PencilIcon className="w-3! h-3!" />
                  </Button>
                }
              >
                {accounts}
              </Group>
            )
          })}
        </Stack>
      )}
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
      justify="between"
      gap={1}
      className="group/account py-2.5"
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
          onClick={() => onEdit(account.id!!)}
        >
          <PencilIcon className="w-3! h-3!" />
        </Button>
        {!deleted && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 w-5 h-5 group-hover/account:opacity-100 transition-opacity text-destructive hover:text-destructive"
            onClick={() => onDelete(account.id!!)}
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

      <Flow gap={2} className="justify-end">
        {balances.map((a) => (
          <AmountLabel key={a.currency} amount={a} />
        ))}
      </Flow>
    </Stack>
  )
}

function LoadingSkeleton() {
  return (
    <Stack gap={6}>
      {(['w-28', 'w-20', 'w-36'] as const).map((w) => (
        <Stack key={w}>
          <Stack orientation="horizontal" align="center" gap={3} className="py-2">
            <Skeleton className={`h-3 ${w}`} />
            <Separator className="flex-1" />
          </Stack>
          <Stack gap={0}>
            {[1, 2].map((j) => (
              <Stack key={j} orientation="horizontal" align="center" gap={1} className="py-2.5">
                <Skeleton className="h-4 w-40 grow" />
                <Flow gap={2}>
                  <Skeleton className="h-4 w-16" />
                </Flow>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}
