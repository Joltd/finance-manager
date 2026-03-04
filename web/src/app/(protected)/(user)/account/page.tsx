'use client'

import { useEffect } from 'react'
import { MoreHorizontalIcon, PencilIcon, PlusIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react'

import { useAccountBalanceStore } from '@/store/account'
import { AmountLabel } from '@/components/common/typography/amount-label'
import type { AccountBalance, AccountBalanceGroup } from '@/types/account'
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

export default function AccountPage() {
  const store = useAccountBalanceStore()

  useEffect(() => {
    void store.fetch()
  }, [store.fetch])

  const groups = store.data?.filter((g) => g.id !== null) ?? []
  const ungrouped = store.data?.find((g) => g.id === null) ?? null

  return (
    <Layout scrollable>
      <div className="flex items-center justify-between">
        <Typography variant="h3">Accounts</Typography>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => console.log('add group')}>
            <PlusIcon />
            Group
          </Button>
          <Button size="sm" onClick={() => console.log('add account')}>
            <PlusIcon />
            Account
          </Button>
        </div>
      </div>

      {store.loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex flex-col gap-8 max-w-2xl">
          {groups.map((group) => (
            <GroupSection key={group.id} group={group} />
          ))}
          {ungrouped && ungrouped.accounts.length > 0 && <GroupSection group={ungrouped} />}
        </div>
      )}
    </Layout>
  )
}

function GroupSection({ group }: { group: AccountBalanceGroup }) {
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
              <DropdownMenuItem onClick={() => console.log('edit group', group.id)}>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => console.log('delete group', group.id)}
              >
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
          group.accounts.map((entry) => <AccountRow key={entry.account.id} entry={entry} />)
        )}
      </div>
    </div>
  )
}

function AccountRow({ entry }: { entry: AccountBalance }) {
  const { account, balances } = entry
  const deleted = account.deleted

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
          <DropdownMenuItem onClick={() => console.log('edit account', account.id)}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {deleted ? (
            <DropdownMenuItem onClick={() => console.log('restore account', account.id)}>
              <RotateCcwIcon />
              Restore
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => console.log('delete account', account.id)}
            >
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
