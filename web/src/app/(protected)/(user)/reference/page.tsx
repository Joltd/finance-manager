'use client'

import { useEffect } from 'react'
import { PencilIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react'

import { ask } from '@/store/common/ask-dialog'
import { useRequest } from '@/hooks/use-request'
import { EntityList } from '@/components/common/layout/entity-list'
import { Layout } from '@/components/common/layout/layout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { accountUrls, currencyUrls, groupUrls } from '@/api/account'
import {
  useAccountGroupListStore,
  useAccountListStore,
  useCurrencyListStore,
} from '@/store/account'
import type { Account, AccountGroup, AccountType, Currency } from '@/types/account'

export default function ReferencePage() {
  return (
    <Layout scrollable>
      <CurrencySection />
      <AccountGroupSection />
      <AccountSection title="Expense accounts" accountType="EXPENSE" />
      <AccountSection title="Income accounts" accountType="INCOME" />
    </Layout>
  )
}

interface ReferenceRowProps {
  label: string
  deleted?: boolean
  badge?: string
  onEdit: () => void
  onDelete: () => void
  onRestore?: () => void
}

function ReferenceRow({ label, deleted, badge, onEdit, onDelete, onRestore }: ReferenceRowProps) {
  return (
    <div className="flex items-center justify-between px-6 py-1.5 hover:bg-muted/50">
      <div className="flex items-center gap-2">
        <span className={cn('text-sm', deleted && 'line-through text-muted-foreground')}>
          {label}
        </span>
        {badge && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon-sm" variant="ghost" onClick={onEdit}>
          <PencilIcon />
        </Button>
        {deleted && onRestore ? (
          <Button size="icon-sm" variant="ghost" onClick={onRestore}>
            <RotateCcwIcon />
          </Button>
        ) : (
          <Button size="icon-sm" variant="ghost" onClick={onDelete}>
            <Trash2Icon />
          </Button>
        )}
      </div>
    </div>
  )
}

function CurrencySection() {
  const store = useCurrencyListStore()
  const updateReq = useRequest<Currency, Currency>(currencyUrls.root)
  const deleteReq = useRequest<void, void, void, { id: string }>(currencyUrls.id, {
    method: 'DELETE',
  })

  const handleAdd = async () => {
    const name = await ask({ type: 'string', label: 'Currency name' })
    if (!name.trim()) return
    await updateReq.submit({ body: { name: name.trim(), crypto: false } })
  }

  const handleEdit = async (item: Currency) => {
    const name = await ask({ type: 'string', label: 'Currency name', initialValue: item.name })
    if (!name.trim()) return
    await updateReq.submit({ body: { ...item, name: name.trim() } })
    void store.fetch()
  }

  const handleDelete = async (item: Currency) => {
    if (!item.id) return
    await deleteReq.submit({ pathParams: { id: item.id } })
    void store.fetch()
  }

  return (
    <EntityList
      store={store}
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

function AccountGroupSection() {
  const store = useAccountGroupListStore()
  const updateReq = useRequest<AccountGroup, AccountGroup>(groupUrls.root)
  const deleteReq = useRequest<void, void, void, { id: string }>(groupUrls.id, {
    method: 'DELETE',
  })

  const handleAdd = async () => {
    const name = await ask({ type: 'string', label: 'Group name' })
    if (!name.trim()) return
    await updateReq.submit({ body: { name: name.trim(), deleted: false } })
  }

  const handleEdit = async (item: AccountGroup) => {
    const name = await ask({ type: 'string', label: 'Group name', initialValue: item.name })
    if (!name.trim()) return
    await updateReq.submit({ body: { ...item, name: name.trim() } })
    void store.fetch()
  }

  const handleDelete = async (item: AccountGroup) => {
    if (!item.id) return
    await deleteReq.submit({ pathParams: { id: item.id } })
    void store.fetch()
  }

  const handleRestore = async (item: AccountGroup) => {
    await updateReq.submit({ body: { ...item, deleted: false } })
    void store.fetch()
  }

  return (
    <EntityList
      store={store}
      title="Account groups"
      subtitle="Logical groups for organizing accounts on the balance sheet"
      getId={(item) => item.id!}
      onAdd={handleAdd}
      renderRow={(item) => (
        <ReferenceRow
          label={item.name}
          deleted={item.deleted}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
          onRestore={item.deleted ? () => handleRestore(item) : undefined}
        />
      )}
    />
  )
}

function AccountSection({ title, accountType }: { title: string; accountType: AccountType }) {
  const store = useAccountListStore()
  const updateReq = useRequest<Account, Account>(accountUrls.root)
  const deleteReq = useRequest<void, void, void, { id: string }>(accountUrls.id, {
    method: 'DELETE',
  })

  useEffect(() => {
    store.setQueryParams({ type: accountType })
    void store.fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = async () => {
    const name = await ask({ type: 'string', label: 'Account name' })
    if (!name.trim()) return
    await updateReq.submit({ body: { name: name.trim(), type: accountType, deleted: false } })
  }

  const handleEdit = async (item: Account) => {
    const name = await ask({ type: 'string', label: 'Account name', initialValue: item.name })
    if (!name.trim()) return
    await updateReq.submit({ body: { ...item, name: name.trim() } })
    void store.fetch()
  }

  const handleDelete = async (item: Account) => {
    if (!item.id) return
    await deleteReq.submit({ pathParams: { id: item.id } })
    void store.fetch()
  }

  const handleRestore = async (item: Account) => {
    await updateReq.submit({ body: { ...item, deleted: false } })
    void store.fetch()
  }

  const subtitle =
    accountType === 'EXPENSE'
      ? 'Categories and destinations where money is spent'
      : 'Sources and streams from which income is received'

  return (
    <EntityList
      store={store}
      title={title}
      subtitle={subtitle}
      getId={(item) => item.id!}
      onAdd={handleAdd}
      renderRow={(item) => (
        <ReferenceRow
          label={item.name}
          deleted={item.deleted}
          badge={item.group?.name}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
          onRestore={item.deleted ? () => handleRestore(item) : undefined}
        />
      )}
    />
  )
}
