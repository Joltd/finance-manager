import { ReferenceInput } from '@/components/common/input/reference-input'
import { OperationType } from '@/types/operation'

type Item = { value: OperationType; label: string }

const OPTIONS: Item[] = [
  { value: 'EXCHANGE', label: 'Exchange' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INCOME', label: 'Income' },
]

type OperationTypeInputBaseProps = {
  placeholder?: string
  disabled?: boolean
  className?: string
}

export type OperationTypeInputProps =
  | (OperationTypeInputBaseProps & { mode?: 'single'; value?: OperationType; onChange?: (value: OperationType) => void })
  | (OperationTypeInputBaseProps & { mode: 'multi'; value?: OperationType[]; onChange?: (value: OperationType[]) => void })

export function OperationTypeInput(props: OperationTypeInputProps) {
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
