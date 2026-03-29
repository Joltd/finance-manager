'use client'

import React, { useCallback, useEffect, useState } from 'react'
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
import { Typography } from '@/components/common/typography/typography'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Button } from '@/components/ui/button'
import { useRequest } from '@/hooks/use-request'
import { Operation, OperationFilter, OperationType } from '@/types/operation'
import { AccountReference, AccountType } from '@/types/account'
import { addDays, format } from 'date-fns'
import { formatDateCommon } from '@/lib/utils'
import { operationUrls } from '@/api/operation'
import { OperationIcon } from '@/components/common/icon/operation-icon'
import { openOperationSheet, openOperationSheetForCopy, OperationSheet } from './operation-sheet'
import { AmountRangeFilter } from '@/components/common/filter/amount-range-filter'
import { Range } from '@/types/common/common'
import { useOperationPresetStore } from '@/store/operation-preset'

function toQuery(filterValue: Record<string, unknown>): OperationFilter {
  return {
    type: filterValue.type as OperationType | undefined,
    account: (filterValue.account as AccountReference | undefined)?.id,
    category: (filterValue.category as AccountReference | undefined)?.id,
    currency: filterValue.currency as string | undefined,
    // amount: filterValue.amount as Range<string> | undefined,
    'amount.from': (filterValue.amount as Range<string> | undefined)?.from,
    'amount.to': (filterValue.amount as Range<string> | undefined)?.to,
  }
}

export default function OperationPage() {
  const store = useOperationSeekStore()
  const preset = useOperationPresetStore()
  const deleteOperation = useRequest(operationUrls.id, { method: 'DELETE' })
  const [filterValue, setFilterValue] = useState<Record<string, unknown>>({})
  const {
    data,
    loadingForward,
    loadingBackward,
    exhaustedForward,
    exhaustedBackward,
    seekForward,
    seekBackward,
    refresh,
    resetData,
    setQueryParams,
    setPointer,
    error,
  } = store

  useEffect(() => {
    setPointer(format(addDays(new Date(), 1), 'yyyy-MM-dd'))
  }, [])

  const handleFilterChange = useCallback(
    (value: Record<string, unknown>) => {
      setFilterValue(value)
      resetData()
      setQueryParams(toQuery(value))
      preset.setType(value.type as OperationType | undefined)
      preset.setAccount(value.account as AccountReference | undefined)
      preset.setCategory(value.category as AccountReference | undefined)
      preset.setCurrency(value.currency as string | undefined)
    },
    [resetData, setQueryParams, preset.setType, preset.setAccount, preset.setCategory, preset.setCurrency],
  )

  const handleSeekForward = useCallback(async () => {
    await seekForward()
    const first = store.data?.[0]
    if (first) preset.setDate(first.date)
  }, [seekForward, preset.setDate])

  const handleSeekBackward = useCallback(async () => {
    await seekBackward()
    const data = store.data
    const last = data?.[data.length - 1]
    if (last) preset.setDate(last.date)
  }, [seekBackward, preset.setDate])

  const handleToDate = useCallback(async () => {
    const date = await ask({ type: 'date', label: 'Select date' })
    resetData()
    setPointer(format(addDays(date, 1), 'yyyy-MM-dd'))
  }, [resetData, setQueryParams, filterValue, setPointer])

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
    void refresh()
  }

  const handleSaved = () => {
    void refresh()
  }

  return (
    <Layout>
      <OperationSheet onSaved={handleSaved} />

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

      <Filter value={filterValue} onChange={handleFilterChange}>
        {/*<DateFilter id="date" label="Date" />*/}
        <OperationTypeFilter id="type" label="Type" />
        <AccountFilter id="account" label="Account" type={AccountType.ACCOUNT} />
        <AccountFilter id="category" label="Category" />
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
  const { type, amountFrom, accountFrom, amountTo, accountTo } = operation
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
      <Stack orientation="horizontal" align="center" gap={1} className="min-w-0">
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

      <Stack
        orientation="horizontal"
        align="center"
        justify="end"
        gap={1}
        className="flex-1 min-w-0"
      >
        <AmountLabel amount={amountFrom} />
        {showBothAmounts && <AmountLabel amount={amountTo} />}
      </Stack>
    </Stack>
  )
}
