import { CurrencyInput } from '@/components/common/currency-input'
import { FilterPrimitiveProps } from '@/types/filter'

export interface CurrencyFilterProps extends FilterPrimitiveProps {}

export function CurrencyFilter({ value, onChange }: CurrencyFilterProps) {
  return (
    <CurrencyInput
      value={value || ''}
      onChange={onChange}
      size="sm"
      className="w-20 shrink-0 rounded-none"
    />
  )
}
