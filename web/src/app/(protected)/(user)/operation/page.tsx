'use client'

import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  CalendarSearch,
  CopyIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import { ask } from '@/store/common/ask-dialog'

import { useOperationSeekStore } from '@/store/operation'
import { Layout } from '@/components/common/layout/layout'
import { Seek } from '@/components/common/layout/seek'
import { Stack } from '@/components/common/layout/stack'
import { Group } from '@/components/common/layout/group'
import { Filter } from '@/components/common/filter/filter'
import { AccountFilter } from '@/components/common/filter/account-filter'
import { OperationTypeFilter } from '@/components/common/filter/operation-type-filter'
import { CurrencyFilter } from '@/components/common/filter/currency-filter'
import { MonthFilter } from '@/components/common/filter/month-filter'
import { TagFilter } from '@/components/common/filter/tag-filter'
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { TagList } from '@/components/common/typography/tag-list'
import { DescriptionLabel } from '@/components/common/typography/description-label'
import { Button } from '@/components/ui/button'
import { useRequest } from '@/hooks/use-request'
import { useSse } from '@/hooks/use-sse'
import { Operation, OperationFilter, OperationType } from '@/types/operation'
import { addDays, format } from 'date-fns'
import { formatDateCommon } from '@/lib/utils'
import { operationChannels, operationUrls } from '@/api/operation'
import { OperationIcon } from '@/components/common/icon/operation-icon'
import { openOperationSheet, openOperationSheetForCopy, OperationSheet } from './operation-sheet'
import { AmountRangeFilter } from '@/components/common/filter/amount-range-filter'
import { Range } from '@/types/common/common'
import { MonthRange } from '@/components/common/input/month-input'
import { useOperationPresetStore } from '@/store/operation-preset'
import {
  readDateRangeParam,
  readIdsParam,
  readNumberRangeParam,
  readParam,
  useFilterUrlSync,
  writeDateRangeParam,
  writeIdsParam,
  writeNumberRangeParam,
  writeParam,
} from '@/lib/filter-url'

const PRESET_KEY = 'OPERATION'

function toQuery(filterValue: Record<string, unknown>): OperationFilter {
  const period = filterValue.period as MonthRange | undefined

  return {
    'date.from': period?.from ? format(period.from, 'yyyy-MM-dd') : undefined,
    'date.to': period?.to ? format(period.to, 'yyyy-MM-dd') : undefined,
    type: filterValue.type as OperationType | undefined,
    include: filterValue.include as string[] | undefined,
    exclude: filterValue.exclude as string[] | undefined,
    includeTags: filterValue.includeTags as string[] | undefined,
    excludeTags: filterValue.excludeTags as string[] | undefined,
    currency: filterValue.currency as string | undefined,
    'amount.from': (filterValue.amount as Range<string> | undefined)?.from,
    'amount.to': (filterValue.amount as Range<string> | undefined)?.to,
  }
}

export default function OperationPage() {
  return (
    <Suspense>
      <OperationPageContent />
    </Suspense>
  )
}

function OperationPageContent() {
  const store = useOperationSeekStore()
  const operationPreset = useOperationPresetStore()
  const deleteOperation = useRequest(operationUrls.id, { method: 'DELETE' })
  const searchParams = useSearchParams()
  const [filterValue, setFilterValue] = useState<Record<string, unknown>>(() => ({
    ...readDateRangeParam(searchParams, 'period'),
    ...readParam(searchParams, 'type'),
    ...readIdsParam(searchParams, 'include'),
    ...readIdsParam(searchParams, 'exclude'),
    ...readIdsParam(searchParams, 'includeTags'),
    ...readIdsParam(searchParams, 'excludeTags'),
    ...readParam(searchParams, 'currency'),
    ...readNumberRangeParam(searchParams, 'amount')
  }))
  const {
    data,
    loadingForward,
    loadingBackward,
    exhaustedForward,
    exhaustedBackward,
    seekForward,
    seekBackward,
    resetData,
    setQueryParams,
    setPointer,
    error,
  } = store

  useSse<string[]>(
    operationChannels.date,
    (dates) => void store.load(dates),
    { debounceMs: 400, merge: (acc, next) => acc.concat(next) },
  )

  useFilterUrlSync(filterValue, (values, params) => {
    writeDateRangeParam(values, params, 'period')
    writeParam(values, params, 'type')
    writeIdsParam(values, params, 'include')
    writeIdsParam(values, params, 'exclude')
    writeIdsParam(values, params, 'includeTags')
    writeIdsParam(values, params, 'excludeTags')
    writeParam(values, params, 'currency')
    writeNumberRangeParam(values, params, 'amount')
  })

  useEffect(() => {
    operationPreset.reset()
    resetData()
    setQueryParams(toQuery(filterValue))
    operationPreset.setType(filterValue.type as OperationType | undefined)
    operationPreset.setCurrency(filterValue.currency as string | undefined)
    setPointer(format(addDays(new Date(), 1), 'yyyy-MM-dd'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterChange = useCallback(
    (value: Record<string, unknown>) => {
      setFilterValue(value)
      resetData()
      setQueryParams(toQuery(value))
      operationPreset.setType(value.type as OperationType | undefined)
      operationPreset.setCurrency(value.currency as string | undefined)
    },
    [resetData, setQueryParams, operationPreset],
  )

  const handleSeekForward = useCallback(async () => {
    await seekForward()
    // const first = store.data?.[0]
    // if (first) operationPreset.setDate(first.date)
  }, [seekForward, operationPreset, store.data])

  const handleSeekBackward = useCallback(async () => {
    await seekBackward()
    // const data = store.data
    // const last = data?.[data.length - 1]
    // if (last) operationPreset.setDate(last.date)
  }, [seekBackward, operationPreset, store.data])

  const handleToDate = useCallback(async () => {
    const date = await ask({ type: 'date', label: 'Select date' })
    resetData()
    setPointer(format(addDays(date, 1), 'yyyy-MM-dd'))
  }, [resetData, setPointer])

  const handleNew = () => {
    openOperationSheet()
  }

  const handleEdit = (operationId?: string) => {
    openOperationSheet(operationId)
  }

  const handleCopy = (operationId?: string) => {
    openOperationSheetForCopy(operationId)
  }

  const handleDelete = async (operationId?: string) => {
    if (!operationId) return
    await deleteOperation.submit({ pathParams: { id: operationId } })
  }

  return (
    <Layout>
      <OperationSheet />

      <Stack orientation="horizontal" align="center" gap={2}>
        <Typography variant="h3" className="grow">
          Operations
        </Typography>
        <Button variant="outline" size="sm" onClick={() => void handleToDate()}>
          <CalendarSearch className="size-4" />
          To date...
        </Button>
        <Button size="sm" onClick={handleNew}>
          <PlusIcon />
          New
        </Button>
      </Stack>

      <Filter value={filterValue} onChange={handleFilterChange} presetKey={PRESET_KEY}>
        <MonthFilter id="period" label="Period" mode="range" />
        <OperationTypeFilter id="type" label="Type" />
        <AccountFilter id="include" label="Include accounts" mode="multi" />
        <AccountFilter id="exclude" label="Exclude accounts" mode="multi" />
        <TagFilter id="includeTags" label="Include tags" mode="multi" />
        <TagFilter id="excludeTags" label="Exclude tags" mode="multi" />
        <CurrencyFilter id="currency" label="Currency" />
        <AmountRangeFilter id="amount" label="Amount" />
      </Filter>

      <Seek
        seekForward={handleSeekForward}
        seekBackward={handleSeekBackward}
        error={error}
        loadingForward={loadingForward}
        loadingBackward={loadingBackward}
        exhaustedForward={exhaustedForward}
        exhaustedBackward={exhaustedBackward}
      >
        {data.map((group) => (
          <Group key={group.date} title={formatDateCommon(group.date)}>
            {group.operations.map((operation, i) => (
              <OperationRow
                key={operation.id ?? i}
                operation={operation}
                onEdit={() => handleEdit(operation.id)}
                onCopy={() => handleCopy(operation.id)}
                onDelete={() => void handleDelete(operation.id)}
              />
            ))}
          </Group>
        ))}
      </Seek>
    </Layout>
  )
}

function OperationRow({
  operation,
  onEdit,
  onCopy,
  onDelete,
}: {
  operation: Operation
  onEdit: () => void
  onCopy: () => void
  onDelete: () => void
}) {
  const { type, amountFrom, accountFrom, amountTo, accountTo, description, tags } = operation
  const showBothAmounts =
    amountFrom.value !== amountTo.value || amountFrom.currency !== amountTo.currency

  return (
    <Stack orientation="horizontal" align="center" gap={3} className="group py-2.5">
      <OperationIcon type={type} size={16} colored className="shrink-0" />
      <Stack orientation="horizontal" align="center" gap={1} className="min-w-0">
        <Typography as="span" variant="small" className="truncate font-medium">
          {accountFrom.name}
        </Typography>
        <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
        <Typography as="span" variant="small" className="truncate text-muted-foreground">
          {accountTo.name}
        </Typography>
      </Stack>
      <Stack orientation="horizontal" align="center" gap={2} className="flex-1 min-w-0">
        <DescriptionLabel description={description} className="min-w-0" />
        <TagList tags={tags} />
      </Stack>

      <Stack orientation="horizontal" align="center" gap={1} className="shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={onEdit}
        >
          <PencilIcon className="w-3! h-3!" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={onCopy}
        >
          <CopyIcon className="w-3! h-3!" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive shrink-0"
          onClick={onDelete}
        >
          <Trash2Icon className="w-3! h-3!" />
        </Button>
      </Stack>

      <Stack orientation="horizontal" align="center" justify="end" gap={1} className="shrink-0">
        <AmountLabel amount={amountFrom} />
        {showBothAmounts && <AmountLabel amount={amountTo} />}
      </Stack>
    </Stack>
  )
}
