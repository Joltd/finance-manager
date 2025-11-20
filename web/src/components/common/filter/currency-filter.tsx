import {
  FilterButton,
  FilterButtonProps,
  useFilterContext,
} from '@/components/common/filter/filter'
import { CurrencyInput } from '@/components/common/input/currency-input'

export interface CurrencyFilterProps extends FilterButtonProps {}

export function CurrencyFilter({ id, label = 'Currency', ...props }: CurrencyFilterProps) {
  const { value, updateValue } = useFilterContext()

  return (
    <FilterButton id={id} label={label} {...props}>
      <CurrencyInput
        value={value?.[id] || ''}
        onChange={(value) => updateValue(id, value)}
        size="sm"
        className="w-20 shrink-0 rounded-none" // todo
      />
    </FilterButton>
  )
}
