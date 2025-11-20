'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useIncomeExpenseStore } from '@/store/report'
import { currentAndPreviousMonths } from '@/lib/date'
import { amount, max } from '@/types/common/amount'
import { Layout } from '@/components/common/layout/layout'
import { Filter } from '@/components/common/filter/filter'
import { MonthRangeFilter } from '@/components/common/filter/date-filter'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Stack } from '@/components/common/layout/stack'
import { Group } from '@/components/common/layout/group'
import { DateLabel } from '@/components/common/typography/date-label'
import { ReportRow } from '@/components/report/report-row'
import { AccountType } from '@/types/account'

export default function Page() {
  const store = useIncomeExpenseStore(
    'loading',
    'dataFetched',
    'error',
    'data',
    'setPayload',
    'fetch',
  )
  const [value, setValue] = useState<Record<string, any>>({
    date: currentAndPreviousMonths(5),
  })

  useEffect(() => {
    store.setPayload(value)
    store.fetch()
  }, [value])

  const maxAmount = useMemo(() => {
    const data = store.data?.groups?.flatMap((group) => group.entries)?.map((entry) => entry.amount)

    let result = amount(0, '')
    if (!!data?.length) {
      result = data.reduce((left, right) => max(left, right)!!)
    }

    return result
  }, [store.data])

  return (
    <Layout>
      <Filter value={value} onChange={setValue}>
        <MonthRangeFilter id="date" alwaysVisible />
      </Filter>
      <DataPlaceholder {...store} data={store.data?.groups}>
        <Stack gap={8} scrollable>
          {store.data?.groups?.map((group) => (
            <Group
              key={group.date}
              text={
                <DateLabel variant="h4" date={group.date} pattern="MMMM yyyy" className="grow" />
              }
            >
              <Stack>
                {group.entries?.map((entry) => (
                  <ReportRow
                    key={entry.type}
                    label={entry.type === AccountType.INCOME ? 'Income' : 'Expense'}
                    amount={entry.amount}
                    maxAmount={maxAmount}
                  />
                ))}
              </Stack>
            </Group>
          ))}
        </Stack>
      </DataPlaceholder>
    </Layout>
  )
}
