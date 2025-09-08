import { FilterPrimitiveProps } from '@/types/common/filter'
import { ReferenceInput } from '@/components/common/reference-input'
import { useAccountReferenceStore } from '@/store/account'
import { AccountLabel } from '@/components/common/account-label'
import { AccountType } from '@/types/account'

export interface AccountFilterProps extends FilterPrimitiveProps {
  type?: AccountType
}

export function AccountFilter({ type, value, onChange }: AccountFilterProps) {
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
      queryParams={{ type }}
      placeholder="choose..."
      size="sm"
      className="rounded-none"
    />
  )
}
