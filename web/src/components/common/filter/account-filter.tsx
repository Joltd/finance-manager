import { FilterPrimitiveProps } from '@/types/filter'
import { ReferenceInput } from '@/components/common/reference-input'
import { useAccountReferenceStore } from '@/store/account'
import { AccountLabel } from '@/components/common/account-label'

export interface AccountFilterProps extends FilterPrimitiveProps {}

export function AccountFilter({ value, onChange }: AccountFilterProps) {
  const accountList = useAccountReferenceStore(
    'data',
    'dataFetched',
    'loading',
    'error',
    'updateQueryParams',
    'fetch',
  )

  return (
    <ReferenceInput
      getId={(account) => account.id}
      fetchStore={accountList}
      renderItem={(account) => <AccountLabel account={account} />}
      value={value}
      onChange={onChange}
      placeholder="choose..."
      size="sm"
      className="rounded-none"
    />
  )
}
