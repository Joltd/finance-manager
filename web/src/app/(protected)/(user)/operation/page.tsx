'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight, CalendarSearch } from 'lucide-react'
import { ask } from '@/store/common/ask-dialog'

import { useOperationSeekStore } from '@/store/operation'
import { SeekDirection } from '@/store/common/seek'
import { Layout } from '@/components/common/layout/layout'
import { Seek } from '@/components/common/layout/seek'
import { Filter } from '@/components/common/filter/filter'
import { AccountFilter } from '@/components/common/filter/account-filter'
import { SelectFilter } from '@/components/common/filter/select-filter'
import { CurrencyFilter } from '@/components/common/filter/currency-filter'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { SelectInputOption } from '@/components/common/input/select-input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { OperationFilter, OperationGroup, OperationRecord, OperationType } from '@/types/operation'
import { AccountReference } from '@/types/account'
import { DateFilter } from '@/components/common/filter/date-filter'

function toQuery(filterValue: Record<string, unknown>): OperationFilter {
  return {
    type: filterValue.type as OperationType | undefined,
    account: (filterValue.account as AccountReference | undefined)?.id,
    currency: filterValue.currency as string | undefined,
  }
}

type TypeConfig = {
  label: string
  icon: React.ElementType
  className: string
}

const TYPE_CONFIG: Record<OperationType, TypeConfig> = {
  EXPENSE: {
    label: 'Expense',
    icon: ArrowUpRight,
    className: 'bg-destructive/10 text-destructive',
  },
  INCOME: {
    label: 'Income',
    icon: ArrowDownLeft,
    className: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  TRANSFER: {
    label: 'Transfer',
    icon: ArrowRight,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  EXCHANGE: {
    label: 'Exchange',
    icon: ArrowLeftRight,
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
}

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = today.getTime() - date.getTime()
  const day = 86_400_000
  if (diff === 0) return 'Today'
  if (diff === day) return 'Yesterday'
  const opts: Intl.DateTimeFormatOptions =
    date.getFullYear() === today.getFullYear()
      ? { weekday: 'short', month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en', opts)
}

export default function OperationPage() {
  const store = useOperationSeekStore()
  const [filterValue, setFilterValue] = useState<Record<string, unknown>>({})
  const { data, loading, exhausted, seek, reset, setQueryParams, setPointer } = store

  useEffect(() => {
    setPointer(new Date().toISOString().split('T')[0])
  }, [])

  const handleFilterChange = useCallback(
    (value: Record<string, unknown>) => {
      setFilterValue(value)
      reset()
      setQueryParams(toQuery(value))
      void seek(SeekDirection.BACKWARD)
    },
    [reset, setQueryParams, seek],
  )

  const handleGoto = useCallback(async () => {
    const date = await ask({ type: 'date', label: 'Select date' })
    reset()
    setQueryParams(toQuery(filterValue))
    setPointer(date.toISOString().split('T')[0])
    void seek(SeekDirection.BACKWARD)
  }, [reset, setQueryParams, filterValue, setPointer, seek])

  return (
    <Layout>
      <div className="shrink-0 flex items-center justify-between">
        <Typography variant="h3">Operations</Typography>
        <Button variant="outline" size="sm" onClick={() => void handleGoto()}>
          <CalendarSearch className="size-4" />
          Goto
        </Button>
      </div>

      <div className="shrink-0">
        <Filter value={filterValue} onChange={handleFilterChange}>
          <DateFilter id="date" label="Date" />
          <SelectFilter<OperationType> id="type" label="Type">
            <SelectInputOption<OperationType> id="EXPENSE" label="Expense" />
            <SelectInputOption<OperationType> id="INCOME" label="Income" />
            <SelectInputOption<OperationType> id="TRANSFER" label="Transfer" />
            <SelectInputOption<OperationType> id="EXCHANGE" label="Exchange" />
          </SelectFilter>
          <AccountFilter id="account" label="Account" />
          <CurrencyFilter id="currency" label="Currency" />
        </Filter>
      </div>

      <Seek seek={seek} loading={loading} exhausted={exhausted} className="flex-1 min-h-0">
        {data.map((group) => (
          <OperationGroupSection key={group.date} group={group} />
        ))}
      </Seek>
    </Layout>
  )
}

function OperationGroupSection({ group }: { group: OperationGroup }) {
  return (
    <div>
      <div className="flex items-center gap-3 py-2 sticky top-0 bg-background z-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {formatGroupDate(group.date)}
        </span>
        <Separator className="flex-1" />
      </div>
      <div className="flex flex-col">
        {group.operations.map((op, i) => (
          <OperationRow key={op.id ?? i} operation={op} />
        ))}
      </div>
    </div>
  )
}

function OperationRow({ operation }: { operation: OperationRecord }) {
  const { type, amountFrom, accountFrom, amountTo, accountTo, description } = operation
  const { icon: Icon, className } = TYPE_CONFIG[type]
  const showBothAmounts =
    amountFrom.value !== amountTo.value || amountFrom.currency !== amountTo.currency

  return (
    <div className="flex items-start gap-3 py-2 -mx-1 px-1 rounded-md hover:bg-muted/40 transition-colors">
      <div
        className={cn(
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
          className,
        )}
      >
        <Icon className="size-3.5" />
      </div>

      <div className="flex flex-1 items-start justify-between gap-4 min-w-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <span className="truncate font-medium">{accountFrom.name}</span>
            <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate text-muted-foreground">{accountTo.name}</span>
          </div>
          {description && (
            <span className="text-xs text-muted-foreground truncate">{description}</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <AmountLabel amount={amountFrom} />
          {showBothAmounts && <AmountLabel amount={amountTo} />}
        </div>
      </div>
    </div>
  )
}
