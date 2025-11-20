import { useEffect, useState } from 'react'
import { asDateRangeValue, asWeek } from '@/lib/date'
import { useImportDataEntryListStore, useImportDataStore } from '@/store/import-data'
import { produce } from 'immer'
import { Filter } from '@/components/common/filter/filter'
import { WeekFilter } from '@/components/common/filter/date-filter'
import { SelectFilter, SelectFilterOption } from '@/components/common/filter/select-filter'

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
    <Filter value={value} onChange={setValue}>
      <WeekFilter
        id="date"
        alwaysVisible
        from={importData.data?.dateRange?.from}
        to={importData.data?.dateRange?.to}
      />
      <SelectFilter id="linkage" label="Linkage" defaultValue={true}>
        <SelectFilterOption id={true} label="established" />
        <SelectFilterOption id={false} label="not established" />
      </SelectFilter>
      <SelectFilter id="entryVisible" label="Entry" defaultValue={true}>
        <SelectFilterOption id={false} label="hidden" />
        <SelectFilterOption id={true} label="visible" />
      </SelectFilter>
      <SelectFilter id="operationVisible" label="Operation" defaultValue={true}>
        <SelectFilterOption id={false} label="hidden" />
        <SelectFilterOption id={true} label="visible" />
      </SelectFilter>
      <SelectFilter id="totalValid" label="Total" defaultValue={false}>
        <SelectFilterOption id={false} label="is invalid" />
        <SelectFilterOption id={true} label="is valid" />
      </SelectFilter>
    </Filter>
  )
}
