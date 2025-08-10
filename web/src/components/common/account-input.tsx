import { AccountReference, AccountType } from '@/types/account'
import { useAccountReferenceStore } from '@/store/account'
import { useRequest } from '@/hooks/use-request'
import { accountUrls } from '@/api/account'
import { askText } from '@/components/common/ask-text-dialog'
import { AccountLabel } from '@/components/common/account-label'
import { ReferenceInput } from '@/components/common/reference-input'

export interface AccountInputProps {
  type: AccountType
  value?: AccountReference
  onChange?: (value?: AccountReference) => void
}

export function AccountInput({ type = AccountType.ACCOUNT, value, onChange }: AccountInputProps) {
  const accountList = useAccountReferenceStore(
    'data',
    'dataFetched',
    'loading',
    'error',
    'setQueryParams',
    'fetch',
  )
  const account = useRequest(accountUrls.root)

  const handleNew = async () => {
    try {
      const name = await askText('Name')
      const result = await account.submit({ name, type })
      await accountList.fetch()
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
      fetchStore={accountList}
      onNew={handleNew}
      renderItem={(account) => <AccountLabel account={account} />}
      className="w-full"
    />
  )
}
