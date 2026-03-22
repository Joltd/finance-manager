'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { ArrowRight, CalendarSearch, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ask } from '@/store/common/ask-dialog'

import { useOperationSeekStore } from '@/store/operation'
import { SeekDirection } from '@/store/common/seek'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRequest } from '@/hooks/use-request'
import { Operation, OperationFilter, OperationType } from '@/types/operation'
import { AccountReference } from '@/types/account'
import { DateFilter } from '@/components/common/filter/date-filter'
import { addDays, format } from 'date-fns'
import { operationUrls } from '@/api/operation'
import { OperationIcon } from '@/components/common/icon/operation-icon'
import { openOperationSheet, OperationSheet } from './operation-sheet'

function toQuery(filterValue: Record<string, unknown>): OperationFilter {
  return {
    type: filterValue.type as OperationType | undefined,
    account: (filterValue.account as AccountReference | undefined)?.id,
    currency: filterValue.currency as string | undefined,
  }
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
  const deleteOperation = useRequest(operationUrls.id, { method: 'DELETE' })
  const [filterValue, setFilterValue] = useState<Record<string, unknown>>({})
  const { data, loading, exhausted, seek, resetData, setQueryParams, setPointer } = store

  useEffect(() => {
    setPointer(format(addDays(new Date(), 1), 'yyyy-MM-dd'))
  }, [])

  const handleFilterChange = useCallback(
    (value: Record<string, unknown>) => {
      setFilterValue(value)
      resetData()
      setQueryParams(toQuery(value))
      void seek(SeekDirection.BACKWARD)
    },
    [resetData, setQueryParams, seek],
  )

  const handleToDate = useCallback(async () => {
    const date = await ask({ type: 'date', label: 'Select date' })
    resetData()
    setPointer(format(addDays(date, 1), 'yyyy-MM-dd'))
  }, [resetData, setQueryParams, filterValue, setPointer, seek])

  const handleNew = () => {
    openOperationSheet()
  }

  const handleEdit = (operationId?: string) => {
    openOperationSheet(operationId)
  }

  const handleDelete = async (operationId?: string) => {
    if (!operationId) return
    await deleteOperation.submit({ pathParams: { id: operationId } })
    resetData()
    void seek(SeekDirection.BACKWARD)
  }

  const handleSaved = () => {
    resetData()
    void seek(SeekDirection.BACKWARD)
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
        <DateFilter id="date" label="Date" />
        <OperationTypeFilter id="type" label="Type" />
        <AccountFilter id="account" label="Account" />
        <CurrencyFilter id="currency" label="Currency" />
      </Filter>

      <Seek seek={seek} loading={loading} exhausted={exhausted}>
        {data.map((group) => (
          <Group key={group.date} title={formatGroupDate(group.date)}>
            {group.operations.map((operation, i) => (
              <OperationRow
                key={operation.id ?? i}
                operation={operation}
                onEdit={() => handleEdit(operation.id)}
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
  onDelete,
}: {
  operation: Operation
  onEdit: () => void
  onDelete: () => void
}) {
  const { type, amountFrom, accountFrom, amountTo, accountTo } = operation
  const showBothAmounts =
    amountFrom.value !== amountTo.value || amountFrom.currency !== amountTo.currency

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Stack
          orientation="horizontal"
          align="center"
          gap={3}
          className="py-2.5 rounded-sm hover:bg-muted/40 transition-colors cursor-pointer focus-visible:outline-none"
        >
          <OperationIcon type={type} size={16} colored className="shrink-0" />

          <Stack
            orientation="horizontal"
            align="center"
            justify="between"
            gap={4}
            className="flex-1 min-w-0"
          >
            <Stack orientation="horizontal" align="center" gap={1} className="min-w-0">
              <Typography as="span" variant="small" className="truncate font-medium">
                {accountFrom.name}
              </Typography>
              <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
              <Typography as="span" variant="small" className="truncate text-muted-foreground">
                {accountTo.name}
              </Typography>
            </Stack>

            <Stack orientation="horizontal" align="end" gap={1} className="shrink-0">
              <AmountLabel amount={amountFrom} />
              {showBothAmounts && <AmountLabel amount={amountTo} />}
            </Stack>
          </Stack>
        </Stack>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={onEdit}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
