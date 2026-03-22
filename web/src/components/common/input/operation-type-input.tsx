import { ReferenceInput } from '@/components/common/input/reference-input'
import { OperationType } from '@/types/operation'

type Item = { value: OperationType; label: string }

const OPTIONS: Item[] = [
  { value: 'EXCHANGE', label: 'Exchange' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INCOME', label: 'Income' },
]

export interface OperationTypeInputProps {
  value?: OperationType
  onChange?: (value: OperationType) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function OperationTypeInput({ value, onChange, ...props }: OperationTypeInputProps) {
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
