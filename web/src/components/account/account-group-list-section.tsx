'use client'
import { Chip } from '@/components/common/chip'
import { useAccountGroupListStore } from '@/store/account'
import { useEffect } from 'react'
import { askText } from '@/components/common/ask-text-dialog'
import { useRequest } from '@/hooks/use-request'
import { accountEvents, accountUrls } from '@/api/account'
import { subscribeSse } from '@/lib/notification'
import { ArchiveRestoreIcon, PlusIcon } from 'lucide-react'
import { AccountGroup } from '@/types/account'
import { cn } from '@/lib/utils'
import { Section } from '@/components/common/layout/section'
import { ResponsiveButton } from '@/components/common/responsive-button'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Flow } from '@/components/common/layout/flow'

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
    await saveGroup.submit({ ...it, name })
  }

  const handleDeleteOrRestore = async (it: AccountGroup) => {
    if (it.deleted) {
      await saveGroup.submit({ ...it, deleted: false })
    } else {
      await deleteGroup.submit({}, { id: it.id })
    }
  }

  return (
    <Section
      text="Account groups"
      actions={
        <ResponsiveButton
          size="sm"
          label="Add account group"
          icon={<PlusIcon />}
          onClick={handleNew}
        />
      }
    >
      <Flow>
        <DataPlaceholder {...accountGroupList}>
          {accountGroupList.data?.map((it) => (
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
