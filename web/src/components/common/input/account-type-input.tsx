import { ReferenceInput } from '@/components/common/input/reference-input'
import { AccountType } from '@/types/account'

type Item = { value: AccountType; label: string }

const OPTIONS: Item[] = [
  { value: AccountType.ACCOUNT, label: 'Account' },
  { value: AccountType.EXPENSE, label: 'Expense' },
  { value: AccountType.INCOME, label: 'Income' },
]

type AccountTypeInputBaseProps = {
  placeholder?: string
  disabled?: boolean
  className?: string
}

export type AccountTypeInputProps =
  | (AccountTypeInputBaseProps & { mode?: 'single'; value?: AccountType; onChange?: (value: AccountType) => void })
  | (AccountTypeInputBaseProps & { mode: 'multi'; value?: AccountType[]; onChange?: (value: AccountType[]) => void })

export function AccountTypeInput(props: AccountTypeInputProps) {
  const { placeholder, disabled, className } = props

  const common = {
    data: OPTIONS,
    getLabel: (o: Item) => o.label,
    getId: (o: Item) => o.value,
    placeholder,
    disabled,
    className,
  }

  if (props.mode === 'multi') {
    const selected = OPTIONS.filter((o) => props.value?.includes(o.value))
    return (
      <ReferenceInput<Item>
        mode="multi"
        {...common}
        value={selected}
        onChange={(items) => props.onChange?.(items.map((i) => i.value))}
      />
    )
  }

  const selected = OPTIONS.find((o) => o.value === props.value)
  return (
    <ReferenceInput<Item>
      {...common}
      value={selected}
      onChange={(o) => props.onChange?.(o.value)}
    />
  )
}
