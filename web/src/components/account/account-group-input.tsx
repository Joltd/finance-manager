import { ReferenceInput } from '@/components/common/reference-input'
import { askText } from '@/components/common/ask-text-dialog'
import { useRequest } from '@/hooks/use-request'
import { accountUrls } from '@/api/account'
import { useAccountGroupReferenceStore } from '@/store/account'
import { Reference } from '@/types/common'

export interface AccountGroupInputProps {
  value?: Reference
  onChange?: (value?: Reference) => void
}

export function AccountGroupInput({ value, onChange }: AccountGroupInputProps) {
  const groupList = useAccountGroupReferenceStore(
    'loading',
    'dataFetched',
    'updateQueryParams',
    'fetch',
    'data',
    'error',
  )
  const group = useRequest(accountUrls.group)

  const handleNew = async () => {
    try {
      const name = await askText('Name')
      const result = await group.submit({ name })
      await groupList.fetch()
      return result
    } catch (error) {
      console.error(error)
      return Promise.reject()
    }
  }

  return (
    <ReferenceInput
      value={value}
      onChange={onChange}
      getId={(it) => it.id}
      fetchStore={groupList}
      onNew={handleNew}
      renderItem={(group) => <div>{group.name}</div>}
      className="w-full"
    />
  )
}
