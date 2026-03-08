'use client'

import { useEffect, useState } from 'react'
import { MoreHorizontalIcon, PencilIcon, PlusIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react'

import { useAccountBalanceStore } from '@/store/account'
import { AmountLabel } from '@/components/common/typography/amount-label'
import type { Account, AccountBalance, AccountBalanceGroup } from '@/types/account'
import { Layout } from '@/components/common/layout/layout'
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
import { AccountSheet } from './account-sheet'

export default function AccountPage() {
  const store = useAccountBalanceStore()
  const saveGroup = useRequest(groupUrls.root)
  const deleteGroup = useRequest(groupUrls.id, { method: 'DELETE' })
  const deleteAccount = useRequest(accountUrls.id, { method: 'DELETE' })
  const restoreAccount = useRequest(accountUrls.root)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined)

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

  const handleDeleteGroup = async (group: AccountBalanceGroup) => {
    await deleteGroup.submit({ pathParams: { id: group.id! } })
    void store.fetch()
  }

  const handleAddAccount = () => {
    setEditingAccount(undefined)
    setSheetOpen(true)
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setSheetOpen(true)
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
    <Layout scrollable>
      <AccountSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        account={editingAccount}
        onSaved={() => void store.fetch()}
      />

      <div className="flex items-center justify-between">
        <Typography variant="h3">Accounts</Typography>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void handleAddGroup()}>
            <PlusIcon />
            Group
          </Button>
          <Button size="sm" onClick={handleAddAccount}>
            <PlusIcon />
            Account
          </Button>
        </div>
      </div>

      {store.loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex flex-col gap-8 max-w-2xl">
          {store.data?.map((group) => (
            <GroupSection
              key={group.id ?? '-'}
              group={group}
              onEdit={handleEditGroup}
              onDelete={handleDeleteGroup}
              onEditAccount={handleEditAccount}
              onDeleteAccount={(a) => void handleDeleteAccount(a)}
              onRestoreAccount={(a) => void handleRestoreAccount(a)}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}

function GroupSection({
  group,
  onEdit,
  onDelete,
  onEditAccount,
  onDeleteAccount,
  onRestoreAccount,
}: {
  group: AccountBalanceGroup
  onEdit: (group: AccountBalanceGroup) => void
  onDelete: (group: AccountBalanceGroup) => void
  onEditAccount: (account: Account) => void
  onDeleteAccount: (account: Account) => void
  onRestoreAccount: (account: Account) => void
}) {
  const isUngrouped = !group.id

  return (
    <div className="flex flex-col group/section">
      <div className="flex items-center justify-between gap-4 mb-1">
        <Typography
          as="span"
          variant="small"
          className={cn('uppercase tracking-widest', isUngrouped && 'text-muted-foreground')}
        >
          {isUngrouped ? 'Ungrouped' : group.name}
        </Typography>
        {!isUngrouped && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover/section:opacity-100 transition-opacity"
              >
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(group)}>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(group)}>
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Separator />

      <div>
        {group.accounts.length === 0 ? (
          <Typography variant="muted" className="py-3">
            No accounts in this group
          </Typography>
        ) : (
          group.accounts.map((entry) => (
              <AccountRow
                key={entry.account.id}
                entry={entry}
                onEdit={onEditAccount}
                onDelete={onDeleteAccount}
                onRestore={onRestoreAccount}
              />
            ))
        )}
      </div>
    </div>
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
    <div className="group flex items-center justify-between py-2.5 hover:bg-muted/40 -mx-2 px-2 rounded-sm">
      <Typography
        as="span"
        variant="small"
        className={cn('w-48 shrink-0', deleted && 'line-through text-muted-foreground')}
      >
        {account.name}
      </Typography>

      <div className="flex-1 flex items-center gap-1.5 flex-wrap">
        {balances.map((a) => (
          <AmountLabel key={a.currency} amount={a} />
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
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
