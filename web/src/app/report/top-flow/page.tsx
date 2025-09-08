'use client'
import { TextLabel } from '@/components/common/text-label'
import { TransactionReportFilter } from '@/components/report/transaction-report-filter'
import React, { useEffect, useState } from 'react'
import { useTopFlowStore } from '@/store/report'
import { TopFlowChart } from '@/components/report/top-flow-chart'
import { DataSection } from '@/components/common/data-section'
import { asDateRangeValue, currentAndPreviousMonths } from '@/lib/date'
import { AccountType } from '@/types/account'

export default function Page() {
  const store = useTopFlowStore(
    'loading',
    'dataFetched',
    'error',
    'data',
    'setQueryParams',
    'fetch',
  )
  const [value, setValue] = useState<Record<string, any>>({
    date: asDateRangeValue(currentAndPreviousMonths(1)),
    type: AccountType.EXPENSE,
  })

  useEffect(() => {
    store.setQueryParams(value)
    store.fetch()
  }, [value])

  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-hidden">
      <TextLabel variant="title" className="grow">
        Top flow
      </TextLabel>
      <TransactionReportFilter value={value} onChange={setValue} />
      <DataSection store={store}>
        <TopFlowChart data={store?.data || []} />
      </DataSection>
    </div>
  )
}
