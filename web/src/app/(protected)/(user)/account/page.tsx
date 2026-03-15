'use client'

import { useEffect } from 'react'
import { PencilIcon, PlusIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react'

import { useAccountBalanceStore } from '@/store/account'
import { AmountLabel } from '@/components/common/typography/amount-label'
import type { Account, AccountBalance, AccountBalanceGroup } from '@/types/account'
import { Layout } from '@/components/common/layout/layout'
import { Group } from '@/components/common/layout/group'
import { Typography } from '@/components/common/typography/typography'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRequest } from '@/hooks/use-request'
import { accountUrls, groupUrls } from '@/api/account'
import { ask } from '@/store/common/ask-dialog'
import { AccountSheet, openAccountSheet } from './account-sheet'
import { Stack } from '@/components/common/layout/stack'
import { Flow } from '@/components/common/layout/flow'

export default function AccountPage() {
  const store = useAccountBalanceStore()
  const saveGroup = useRequest(groupUrls.root)
  const deleteAccount = useRequest(accountUrls.id, { method: 'DELETE' })
  const restoreAccount = useRequest(accountUrls.root)

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

  const handleEditAccount = (account: Account) => {
    openAccountSheet(account.id)
  }

  const handleDeleteAccount = async (account: Account) => {
    await deleteAccount.submit({ pathParams: { id: account.id! } })
    void store.fetch()
  }

  const handleRestoreAccount = async (account: Account) => {
    await restoreAccount.submit({ body: { ...account, deleted: false } })
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
                    onRestore={(a) => void handleRestoreAccount(a)}
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
              <Group key={group.id} title={group.name} onEdit={() => void handleEditGroup(group)}>
                {accounts}
              </Group>
            )
          })}
        </Stack>
      )}
    </Layout>
  )
}

function AccountRow({
  entry,
  onEdit,
  onDelete,
  onRestore,
}: {
  entry: AccountBalance
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
  onRestore: (account: Account) => void
}) {
  const { account, balances } = entry
  const deleted = account.deleted

  const accountEntity: Account = {
    id: account.id,
    name: account.name,
    type: account.type,
    deleted: account.deleted,
    reviseDate: account.reviseDate,
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Stack
          orientation="horizontal"
          align="center"
          justify="between"
          gap={1}
          className="py-2.5 hover:bg-muted/40 rounded-sm cursor-pointer focus-visible:outline-none"
        >
          <Typography
            as="span"
            variant="small"
            className={cn('grow', deleted && 'line-through text-muted-foreground')}
          >
            {account.name}
          </Typography>

          <Flow gap={2} className="justify-end">
            {balances.map((a) => (
              <AmountLabel key={a.currency} amount={a} />
            ))}
          </Flow>
        </Stack>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onEdit(accountEntity)}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {deleted ? (
          <DropdownMenuItem onClick={() => onRestore(accountEntity)}>
            <RotateCcwIcon />
            Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(accountEntity)}>
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[28, 20, 36].map((w) => (
        <div key={w} className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-1">
            <Skeleton className={`h-3 w-${w}`} />
          </div>
          <Separator />
          <div className="flex flex-col gap-0.5 pt-0.5">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center gap-4 py-2.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
