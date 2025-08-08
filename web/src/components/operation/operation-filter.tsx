import { Filter } from '@/components/common/filter/filter'
import { WeekFilter } from '@/components/common/filter/week-filter'
import { useEffect, useState } from 'react'
import { useOperationListStore } from '@/store/operation'
import { SelectFilter, SelectFilterOption } from '@/components/common/filter/select-filter'
import { OperationType } from '@/types/operation'
import { asDateRangeValue, asWeek } from '@/lib/date'

export function OperationFilter() {
  const operationList = useOperationListStore('setQueryParams', 'fetch')
  const [value, setValue] = useState<Record<string, any>>({
    date: asDateRangeValue(asWeek(new Date())),
  })

  useEffect(() => {
    operationList.setQueryParams(value)
    operationList.fetch()
  }, [value])

  return (
    <Filter value={value} onChange={setValue} className="bg-accent p-4 rounded-sm">
      <WeekFilter name="date" alwaysVisible />
      <SelectFilter name="type" label="Type" defaultValue={OperationType.EXPENSE}>
        <SelectFilterOption value={OperationType.EXCHANGE} label="is exchange" />
        <SelectFilterOption value={OperationType.TRANSFER} label="is transfer" />
        <SelectFilterOption value={OperationType.EXPENSE} label="is expense" />
        <SelectFilterOption value={OperationType.INCOME} label="is income" />
      </SelectFilter>
    </Filter>
  )
}
