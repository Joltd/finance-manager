'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useTopFlowStore } from '@/store/report'
import { currentAndPreviousMonths } from '@/lib/date'
import { AccountReference, AccountType } from '@/types/account'
import { Layout } from '@/components/common/layout/layout'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Group } from '@/components/common/layout/group'
import { DateLabel } from '@/components/common/typography/date-label'
import { Stack } from '@/components/common/layout/stack'
import { ReportRow } from '@/components/report/report-row'
import { Filter } from '@/components/common/filter/filter'
import { MonthRangeFilter } from '@/components/common/filter/date-filter'
import { AccountFilter } from '@/components/common/filter/account-filter'
import { SelectFilter, SelectFilterOption } from '@/components/common/filter/select-filter'
import { amount, max } from '@/types/common/amount'
import { produce } from 'immer'
import { Pointable } from '@/components/common/pointable'
import { AmountLabelNew } from '@/components/common/typography/amount-label'
import { AccountLabel } from '@/components/common/typography/account-label'

export default function Page() {
  const store = useTopFlowStore('loading', 'dataFetched', 'error', 'data', 'setPayload', 'fetch')
  const [value, setValue] = useState<Record<string, any>>({
    date: currentAndPreviousMonths(5),
    type: AccountType.EXPENSE,
  })
  const [showOther, setShowOther] = useState<string[]>([])

  useEffect(() => {
    const actualValue = {
      ...value,
      exclude: value.exclude?.map((it: AccountReference) => it.id),
      include: value.include?.map((it: AccountReference) => it.id),
    }
    store.setPayload(actualValue)
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

  const handleHide = (account?: AccountReference) => {
    if (!account) {
      return
    }
    setValue((previous) =>
      produce(previous, (draft) => {
        draft.exclude = [...(draft.exclude || []), account]
      }),
    )
  }

  const handleToggleOther = (date: string) => {
    setShowOther((previous) => {
      const filtered = previous.filter((it) => it !== date)
      if (filtered.length !== previous.length) {
        return filtered
      } else {
        return [...previous, date]
      }
    })
  }

  return (
    <Layout>
      <Filter value={value} onChange={setValue}>
        <MonthRangeFilter id="date" alwaysVisible />
        <SelectFilter id="type" label="Type" alwaysVisible>
          <SelectFilterOption id={AccountType.INCOME} label="is income" />
          <SelectFilterOption id={AccountType.EXPENSE} label="is expense" />
        </SelectFilter>
        <AccountFilter id="exclude" label="Without accounts" multiple />
        <AccountFilter id="include" label="With accounts" multiple />
      </Filter>
      <DataPlaceholder {...store} data={store.data?.groups}>
        <Stack gap={8} scrollable>
          {store.data?.groups?.map((group) => (
            <Group
              key={group.date}
              text={
                <Stack orientation="horizontal">
                  <DateLabel variant="h4" date={group.date} pattern="MMMM yyyy" className="grow" />
                  <AmountLabelNew amount={group.amount} />
                </Stack>
              }
            >
              <Stack>
                {group.entries
                  ?.filter((entry) => !entry.other)
                  ?.map((entry) => (
                    <ReportRow
                      key={entry.account?.id || 'other'}
                      label={<AccountLabel account={entry.account} />}
                      amount={entry.amount}
                      maxAmount={maxAmount}
                      onHide={handleHide}
                    />
                  ))}
                {group.entries
                  ?.filter((entry) => entry.other)
                  ?.map((entry) => (
                    <Pointable key={'other'} onClick={() => handleToggleOther(group.date)}>
                      <ReportRow label="Other" amount={entry.amount} maxAmount={maxAmount} />
                    </Pointable>
                  ))}
                {showOther.includes(group.date) &&
                  group.otherEntries?.map((entry) => (
                    <ReportRow
                      key={entry.account?.id || 'other'}
                      label={entry.account ? <AccountLabel account={entry.account} /> : 'Other'}
                      amount={entry.amount}
                      maxAmount={maxAmount}
                      onHide={() => handleHide(entry.account)}
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
