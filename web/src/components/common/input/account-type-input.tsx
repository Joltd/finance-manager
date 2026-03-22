import { ReferenceInput } from '@/components/common/input/reference-input'
import { AccountType } from '@/types/account'

type Item = { value: AccountType; label: string }

const OPTIONS: Item[] = [
  { value: AccountType.ACCOUNT, label: 'Account' },
  { value: AccountType.EXPENSE, label: 'Expense' },
  { value: AccountType.INCOME, label: 'Income' },
]

export interface AccountTypeInputProps {
  value?: AccountType
  onChange?: (value: AccountType) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AccountTypeInput({ value, onChange, ...props }: AccountTypeInputProps) {
  const selectedItem = OPTIONS.find((o) => o.value === value)

  return (
    <ReferenceInput<Item>
      data={OPTIONS}
      getLabel={(o) => o.label}
      getId={(o) => o.value}
      value={selectedItem}
      onChange={(o) => onChange?.(o.value)}
      {...props}
    />
  )
}
