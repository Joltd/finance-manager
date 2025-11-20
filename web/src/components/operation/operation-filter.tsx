import { useEffect, useState } from 'react'
import { useOperationListStore } from '@/store/operation'
import { OperationType } from '@/types/operation'
import { asDateRangeValue, asWeek } from '@/lib/date'
import { Filter } from '@/components/common/filter/filter'
import { WeekFilter } from '@/components/common/filter/date-filter'
import { SelectFilter, SelectFilterOption } from '@/components/common/filter/select-filter'
import { AccountFilter } from '@/components/common/filter/account-filter'
import { CurrencyFilter } from '@/components/common/filter/currency-filter'

export function OperationFilter() {
  const operationList = useOperationListStore('setQueryParams', 'fetch')
  const [value, setValue] = useState<Record<string, any>>({
    date: asDateRangeValue(asWeek(new Date())),
  })

  useEffect(() => {
    const actualValue = {
      ...value,
      account: value.account?.id,
    }
    operationList.setQueryParams(actualValue)
    operationList.fetch()
  }, [value])

  return (
    <Filter value={value} onChange={setValue}>
      <WeekFilter id="date" alwaysVisible />
      <SelectFilter id="type" label="Type" defaultValue={OperationType.EXPENSE}>
        <SelectFilterOption id={OperationType.EXCHANGE} label="is exchange" />
        <SelectFilterOption id={OperationType.TRANSFER} label="is transfer" />
        <SelectFilterOption id={OperationType.EXPENSE} label="is expense" />
        <SelectFilterOption id={OperationType.INCOME} label="is income" />
      </SelectFilter>
      <AccountFilter id="account" label="Account" />
      <CurrencyFilter id="currency" label="Currency" />
    </Filter>
  )
}
