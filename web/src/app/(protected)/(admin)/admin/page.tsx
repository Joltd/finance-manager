'use client'

import { useEffect } from 'react'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { userUrls } from '@/api/user'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useRequest } from '@/hooks/use-request'
import { useAdminUserListStore } from '@/store/user'
import { AdminUser } from '@/types/user'
import { cn } from '@/lib/utils'
import { UserSheet, openUserSheet } from './user-sheet'

export default function AdminPage() {
  const store = useAdminUserListStore()
  const deleteUser = useRequest(userUrls.adminId, { method: 'DELETE' })

  useEffect(() => {
    void store.fetch()
  }, [store.fetch])

  const handleDeleteUser = async (user: AdminUser) => {
    await deleteUser.submit({ pathParams: { id: user.id! } })
    void store.fetch()
  }

  return (
    <Layout>
      <UserSheet />

      <Stack orientation="horizontal" gap={2}>
        <Typography variant="h3" className="grow">
          Users
        </Typography>
        <Button size="sm" onClick={() => openUserSheet()}>
          <PlusIcon />
          User
        </Button>
      </Stack>

      {store.loading ? (
        <LoadingSkeleton />
      ) : (
        <Stack scrollable gap={0}>
          {store.data?.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onEdit={() => openUserSheet(user.id)}
              onDelete={() => void handleDeleteUser(user)}
            />
          ))}
          {store.data?.length === 0 && (
            <Typography variant="muted" className="py-3">
              No users
            </Typography>
          )}
        </Stack>
      )}
    </Layout>
  )
}

function UserRow({
  user,
  onEdit,
  onDelete,
}: {
  user: AdminUser
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Stack
          orientation="horizontal"
          align="center"
          gap={4}
          className="py-2.5 hover:bg-muted/40 rounded-sm cursor-pointer focus-visible:outline-none"
        >
          <Typography
            as="span"
            variant="small"
            className={cn('grow', user.deleted && 'line-through text-muted-foreground')}
          >
            {user.name}
          </Typography>
          <Typography as="span" variant="muted" className="text-xs shrink-0">
            {user.login}
          </Typography>
        </Stack>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={onEdit}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 py-2.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}