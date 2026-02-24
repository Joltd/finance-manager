import { useEffect, useState } from 'react'
import { useOperationListStore } from '@/store/operation'
import { OperationType } from '@/types/operation'
import { Filter } from '@/components/common/filter/filter'
import { DateRangeFilter } from '@/components/common/filter/date-filter'
import { SelectFilter, SelectFilterOption } from '@/components/common/filter/select-filter'
import { AccountFilter } from '@/components/common/filter/account-filter'
import { CurrencyFilter } from '@/components/common/filter/currency-filter'
import { Button } from '@/components/ui/button'
import { askDate } from '@/components/common/ask-date-dialog'

export function OperationFilter() {
  const operationList = useOperationListStore(
    'pointer',
    'setPointer',
    'resetData',
    'seekBackward',
    'setQueryParams',
  )
  const [value, setValue] = useState<Record<string, any>>({})

  useEffect(() => {
    const actualValue = {
      ...value,
      account: value.account?.id,
    }
    operationList.setQueryParams(actualValue)
    operationList.resetData()
    operationList.seekBackward()
  }, [value])

  const handleGoto = () => {
    askDate('Select date', operationList.pointer).then((result) => {
      operationList.setPointer(result)
      operationList.resetData()
      operationList.seekBackward()
    })
  }

  return (
    <Filter value={value} onChange={setValue}>
      <Button variant="outline" size="sm" onClick={handleGoto}>
        Goto...
      </Button>
      <DateRangeFilter id="date" />
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
