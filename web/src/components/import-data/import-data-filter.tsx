import { Filter } from '@/components/common/filter/filter'
import { WeekFilter } from '@/components/common/filter/week-filter'
import { useEffect, useState } from 'react'
import { SelectFilter, SelectFilterOption } from '@/components/common/filter/select-filter'
import { asDateRangeValue, asWeek } from '@/lib/date'
import { useImportDataEntryListStore, useImportDataStore } from '@/store/import-data'
import { produce } from 'immer'

export interface ImportDataOperationFilterProps {}

export function ImportDataFilter({}: ImportDataOperationFilterProps) {
  const importData = useImportDataStore('data')
  const importDataEntryList = useImportDataEntryListStore('data', 'setQueryParams', 'fetch')
  const [value, setValue] = useState<Record<string, any>>({})

  useEffect(() => {
    const dateRangeFrom = importData.data?.dateRange?.from
    if (!dateRangeFrom) {
      return
    }
    setValue((previous) =>
      produce(previous, (draft) => {
        if (!draft.date) {
          draft.date = asDateRangeValue(asWeek(dateRangeFrom))
        }
      }),
    )
  }, [importData.data])

  useEffect(() => {
    if (!importData.data || !Object.keys(value).length) {
      return
    }
    importDataEntryList.setQueryParams(value)
    importDataEntryList.fetch()
  }, [value])

  return (
    <Filter value={value} onChange={setValue} className="bg-accent p-4 rounded-sm">
      <WeekFilter
        name="date"
        alwaysVisible
        from={importData.data?.dateRange?.from}
        to={importData.data?.dateRange?.to}
      />
      <SelectFilter name="linkage" label="Linkage" defaultValue={true}>
        <SelectFilterOption value={true} label="established" />
        <SelectFilterOption value={false} label="not established" />
      </SelectFilter>
      <SelectFilter name="entryVisible" label="Entry" defaultValue={true}>
        <SelectFilterOption value={false} label="hidden" />
        <SelectFilterOption value={true} label="visible" />
      </SelectFilter>
      <SelectFilter name="operationVisible" label="Operation" defaultValue={true}>
        <SelectFilterOption value={false} label="hidden" />
        <SelectFilterOption value={true} label="visible" />
      </SelectFilter>
      <SelectFilter name="totalValid" label="Total" defaultValue={false}>
        <SelectFilterOption value={false} label="is invalid" />
        <SelectFilterOption value={true} label="is valid" />
      </SelectFilter>
    </Filter>
  )
}
