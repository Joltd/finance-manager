'use client'
import { Chip } from '@/components/common/chip'
import { useAccountListStore } from '@/store/account'
import { useEffect } from 'react'
import { Account, AccountType } from '@/types/account'
import { askText } from '@/components/common/ask-text-dialog'
import { useRequest } from '@/hooks/use-request'
import { accountEvents, accountUrls } from '@/api/account'
import { ArchiveRestoreIcon, PlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Section } from '@/components/common/layout/section'
import { ResponsiveButton } from '@/components/common/responsive-button'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Flow } from '@/components/common/layout/flow'
import { Sse } from '@/components/sse'

interface AccountListSectionProps {
  title: string
  accountType: AccountType
}

export function AccountListSection({ title, accountType }: AccountListSectionProps) {
  const accountList = useAccountListStore(
    'fetch',
    'data',
    'loading',
    'dataFetched',
    'data',
    'error',
  )
  const saveAccount = useRequest(accountUrls.root)
  const deleteAccount = useRequest(accountUrls.id, { method: 'DELETE' })

  useEffect(() => {
    accountList.fetch()
  }, [])

  const handleNew = async () => {
    const name = await askText('Name')
    await saveAccount.submit({ name, type: accountType })
  }

  const handleEdit = async (it: Account) => {
    const name = await askText('Name', it.name)
    await saveAccount.submit({ ...it, name })
  }

  const handleDeleteOrRestore = async (it: Account) => {
    if (it.deleted) {
      await saveAccount.submit({ ...it, deleted: false })
    } else {
      await deleteAccount.submit({}, { id: it.id })
    }
  }

  const filteredAccounts = accountList.data?.filter((it) => it.type === accountType) || []

  return (
    <Section
      text={title}
      actions={
        <ResponsiveButton size="sm" label="Add account" icon={<PlusIcon />} onClick={handleNew} />
      }
    >
      <Sse eventName={accountEvents.root} listener={accountList.fetch} />
      <Flow>
        <DataPlaceholder {...accountList}>
          {filteredAccounts.map((it) => (
            <Chip
              key={it.id}
              text={it.name}
              onClick={() => handleEdit(it)}
              onDismiss={() => handleDeleteOrRestore(it)}
              icon={it.deleted ? <ArchiveRestoreIcon className="text-white" /> : undefined}
              className={cn(it.deleted && 'line-through text-muted')}
            />
          ))}
        </DataPlaceholder>
      </Flow>
    </Section>
  )
}
