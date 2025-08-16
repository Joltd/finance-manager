'use client'
import { TextLabel } from '@/components/common/text-label'
import { DataSection } from '@/components/common/data-section'
import { Chip } from '@/components/common/chip'
import { useAccountGroupListStore } from '@/store/account'
import { useEffect } from 'react'
import { askText } from '@/components/common/ask-text-dialog'
import { useRequest } from '@/hooks/use-request'
import { accountEvents, accountUrls } from '@/api/account'
import { subscribeSse } from '@/lib/notification'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { AccountGroup } from '@/types/account'
import { cn } from '@/lib/utils'

export function AccountGroupListSection() {
  const accountGroupList = useAccountGroupListStore(
    'fetch',
    'data',
    'loading',
    'dataFetched',
    'data',
    'error',
  )
  const saveGroup = useRequest(accountUrls.group)
  const deleteGroup = useRequest(accountUrls.groupId, { method: 'DELETE' })

  useEffect(() => {
    accountGroupList.fetch()
    return subscribeSse(accountEvents.group, {}, () => accountGroupList.fetch())
  }, [])

  const handleNew = async () => {
    const name = await askText('Name')
    await saveGroup.submit({ name })
  }

  const handleEdit = async (it: AccountGroup) => {
    const name = await askText('Name', it.name)
    await saveGroup.submit({ id: it.id, name })
  }

  const handleDelete = async (it: AccountGroup) => {
    await deleteGroup.submit({}, { id: it.id })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <TextLabel variant="title" className="grow">
          Account groups
        </TextLabel>
        <Button onClick={handleNew}>
          <PlusIcon />
          Add account group
        </Button>
      </div>
      <DataSection store={accountGroupList}>
        <div className="flex flex-wrap gap-2">
          {accountGroupList.data?.map((it) => (
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
