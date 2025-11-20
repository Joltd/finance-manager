import {
  FilterButton,
  FilterButtonProps,
  useFilterContext,
} from '@/components/common/filter/filter'
import { AccountLabel } from '@/components/common/typography/account-label'
import { ReferenceInput } from '@/components/common/input/reference-input'
import { useAccountReferenceStore } from '@/store/account'
import { AccountReference, AccountType } from '@/types/account'

export interface AccountFilterProps extends FilterButtonProps {
  type?: AccountType
  multiple?: boolean
}

export function AccountFilter({
  type,
  multiple,
  id,
  label = 'Account',
  ...props
}: AccountFilterProps) {
  const { value, updateValue } = useFilterContext()
  const accountList = useAccountReferenceStore(
    'data',
    'dataFetched',
    'loading',
    'error',
    'updateQueryParams',
    'fetch',
    'reset',
  )

  return (
    <FilterButton id={id} label={label} {...props}>
      <ReferenceInput
        mode={multiple ? 'multiple' : 'single'}
        getId={(account) => account.id}
        fetchStore={accountList}
        renderItem={(account) => <AccountLabel account={account} />}
        value={value?.[id]}
        onValueChange={(value: AccountReference | AccountReference[] | undefined) =>
          updateValue(id, value)
        }
        queryParams={{ type }}
        placeholder="choose..."
        size="sm"
        className="rounded-none"
      />
    </FilterButton>
  )
}
