'use client'

import { useEffect } from 'react'
import { PencilIcon, Trash2Icon } from 'lucide-react'

import { ask } from '@/store/common/ask-dialog'
import { useRequest } from '@/hooks/use-request'
import { EntityList } from '@/components/common/layout/entity-list'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { accountUrls, currencyUrls } from '@/api/account'
import { tagUrls } from '@/api/tag'
import type { Account, Currency } from '@/types/account'
import { AccountType } from '@/types/account'
import type { Tag } from '@/types/tag'
import { AccountDialog, openAccountDialog } from './account-dialog'

export default function ReferencePage() {
  return (
    <Layout scrollable>
      <AccountDialog />
      <CurrencySection />
      <TagSection />
      <AccountSection title="Expense accounts" accountType={AccountType.EXPENSE} />
      <AccountSection title="Income accounts" accountType={AccountType.INCOME} />
    </Layout>
  )
}

interface ReferenceRowProps {
  label: string
  deleted?: boolean
  badge?: string
  onEdit: () => void
  onDelete: () => void
}

function ReferenceRow({ label, deleted, badge, onEdit, onDelete }: ReferenceRowProps) {
  return (
    <Stack orientation="horizontal" align="center" gap={1} className="group px-6 py-3">
      <Typography
        as="span"
        variant="small"
        className={cn(deleted && 'line-through text-muted-foreground')}
      >
        {label}
      </Typography>
      <Button
        size="icon"
        variant="ghost"
        className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity"
        onClick={onEdit}
      >
        <PencilIcon className="w-3! h-3!" />
      </Button>
      {!deleted && (
        <Button
          size="icon"
          variant="ghost"
          className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2Icon className="w-3! h-3!" />
        </Button>
      )}
      {badge && (
        <Typography
          as="span"
          variant="muted"
          className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded"
        >
          {badge}
        </Typography>
      )}
    </Stack>
  )
}

function CurrencySection() {
  const listReq = useRequest<Currency[]>(currencyUrls.root, { method: 'GET' })
  const updateReq = useRequest<Currency, Currency>(currencyUrls.root)
  const deleteReq = useRequest<void, void, void, { id: string }>(currencyUrls.id, {
    method: 'DELETE',
  })

  useEffect(() => {
    void listReq.submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = async () => {
    const name = await ask({ type: 'string', label: 'Currency name' })
    if (!name.trim()) return
    await updateReq.submit({ body: { name: name.trim(), crypto: false } })
    void listReq.submit()
  }

  const handleEdit = async (item: Currency) => {
    const name = await ask({ type: 'string', label: 'Currency name', initialValue: item.name })
    if (!name.trim()) return
    await updateReq.submit({ body: { ...item, name: name.trim() } })
    void listReq.submit()
  }

  const handleDelete = async (item: Currency) => {
    if (!item.id) return
    await deleteReq.submit({ pathParams: { id: item.id } })
    void listReq.submit()
  }

  return (
    <EntityList
      data={listReq.data}
      loading={listReq.loading}
      error={listReq.error ?? null}
      title="Currencies"
      subtitle="Fiat and crypto currencies used across accounts and transactions"
      getId={(item) => item.id!}
      onAdd={handleAdd}
      renderRow={(item) => (
        <ReferenceRow
          label={item.name}
          badge={item.crypto ? 'crypto' : undefined}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
        />
      )}
    />
  )
}

function TagSection() {
  const listReq = useRequest<Tag[]>(tagUrls.root, { method: 'GET' })
  const updateReq = useRequest<Tag, Tag>(tagUrls.root)
  const deleteReq = useRequest<void, void, void, { id: string }>(tagUrls.id, { method: 'DELETE' })

  useEffect(() => {
    void listReq.submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = async () => {
    const name = await ask({ type: 'string', label: 'Tag name' })
    if (!name.trim()) return
    await updateReq.submit({ body: { name: name.trim(), deleted: false } })
    void listReq.submit()
  }

  const handleEdit = async (item: Tag) => {
    const name = await ask({ type: 'string', label: 'Tag name', initialValue: item.name })
    if (!name.trim()) return
    await updateReq.submit({ body: { ...item, name: name.trim() } })
    void listReq.submit()
  }

  const handleDelete = async (item: Tag) => {
    if (!item.id) return
    await deleteReq.submit({ pathParams: { id: item.id } })
    void listReq.submit()
  }

  return (
    <EntityList
      data={listReq.data}
      loading={listReq.loading}
      error={listReq.error ?? null}
      title="Tags"
      subtitle="Labels for grouping and filtering operations"
      getId={(item) => item.id!}
      onAdd={handleAdd}
      renderRow={(item) => (
        <ReferenceRow
          label={item.name}
          deleted={item.deleted}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
        />
      )}
    />
  )
}

function AccountSection({ title, accountType }: { title: string; accountType: AccountType }) {
  const listReq = useRequest<Account[]>(accountUrls.root, { method: 'GET' })
  const updateReq = useRequest<Account, Account>(accountUrls.root)
  const deleteReq = useRequest<void, void, void, { id: string }>(accountUrls.id, {
    method: 'DELETE',
  })

  const fetchList = () => listReq.submit({ queryParams: { type: accountType } })

  useEffect(() => {
    void fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = async () => {
    const name = await ask({ type: 'string', label: 'Account name' })
    if (!name.trim()) return
    await updateReq.submit({
      body: { name: name.trim(), type: accountType, deleted: false, reportExclude: false },
    })
    void fetchList()
  }

  const handleEdit = (item: Account) => {
    openAccountDialog(item, fetchList)
  }

  const handleDelete = async (item: Account) => {
    if (!item.id) return
    await deleteReq.submit({ pathParams: { id: item.id } })
    void fetchList()
  }

  const subtitle =
    accountType === AccountType.EXPENSE
      ? 'Categories and destinations where money is spent'
      : 'Sources and streams from which income is received'

  return (
    <EntityList
      data={listReq.data}
      loading={listReq.loading}
      error={listReq.error ?? null}
      title={title}
      subtitle={subtitle}
      getId={(item) => item.id!}
      onAdd={handleAdd}
      renderRow={(item) => (
        <ReferenceRow
          label={item.name}
          deleted={item.deleted}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
        />
      )}
    />
  )
}
