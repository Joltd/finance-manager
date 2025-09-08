import { Filter } from '@/components/common/filter/filter'
import { AccountType } from '@/types/account'
import { SelectFilter, SelectFilterOption } from '@/components/common/filter/select-filter'
import { DateFilter } from '@/components/common/filter/date-filter'

export interface TransactionReportFilterProps {
  value?: Record<string, any>
  onChange?: (value: Record<string, any>) => void
}

export function TransactionReportFilter({ value, onChange }: TransactionReportFilterProps) {
  return (
    <Filter value={value} onChange={onChange} className="bg-accent p-4 rounded-sm">
      <DateFilter name="date" alwaysVisible />
      <SelectFilter name="type" label="Type" alwaysVisible defaultValue={AccountType.EXPENSE}>
        <SelectFilterOption value={AccountType.EXPENSE} label="is expense" />
        <SelectFilterOption value={AccountType.INCOME} label="is income" />
      </SelectFilter>
    </Filter>
  )
}
