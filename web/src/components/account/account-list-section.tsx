'use client'
import { TextLabel } from '@/components/common/text-label'
import { DataSection } from '@/components/common/data-section'
import { Chip } from '@/components/common/chip'
import { useAccountListStore } from '@/store/account'
import { useEffect } from 'react'
import { Account, AccountType } from '@/types/account'
import { askText } from '@/components/common/ask-text-dialog'
import { useRequest } from '@/hooks/use-request'
import { accountEvents, accountUrls } from '@/api/account'
import { subscribeSse } from '@/lib/notification'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    return subscribeSse(accountEvents.root, {}, () => accountList.fetch())
  }, [])

  const handleNew = async () => {
    const name = await askText('Name')
    await saveAccount.submit({ name, type: accountType })
  }

  const handleEdit = async (it: Account) => {
    const name = await askText('Name', it.name)
    await saveAccount.submit({ id: it.id, name, type: it.type })
  }

  const handleDelete = async (it: Account) => {
    await deleteAccount.submit({}, { id: it.id })
  }

  const filteredAccounts = accountList.data?.filter((it) => it.type === accountType) || []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <TextLabel variant="title" className="grow">
          {title}
        </TextLabel>
        <Button onClick={handleNew}>
          <PlusIcon />
          Add account
        </Button>
      </div>
      <DataSection store={accountList}>
        <div className="flex flex-wrap gap-2">
          {filteredAccounts.map((it) => (
            <Chip
              key={it.id}
              text={it.name}
              onClick={() => handleEdit(it)}
              onDismiss={() => handleDelete(it)}
              className={cn(it.deleted && 'line-through')}
            />
          ))}
        </div>
      </DataSection>
    </div>
  )
}
