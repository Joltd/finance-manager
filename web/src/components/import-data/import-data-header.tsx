import { DataPlaceholder } from '@/components/common/data-placeholder'
import { useImportDataStore } from '@/store/import-data'
import { Stack } from '@/components/common/layout/stack'
import { cn } from '@/lib/utils'
import { amount, Amount, minus, plus } from '@/types/common/amount'
import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'
import { askText } from '@/components/common/ask-text-dialog'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { EditIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { ErrorLabel } from '@/components/common/typography/error-label'
import { useBalanceStore } from '@/store/balance'
import { useEffect, useMemo } from 'react'
import { balanceEvents } from '@/api/balance'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pointable } from '@/components/common/pointable'
import { ValidityIcon } from '@/components/common/icon/validity-icon'
import { Typography } from '@/components/common/typography/typography'
import { Sse } from '@/components/sse'

export interface ImportDataHeaderProps {}

export function ImportDataHeader(props: ImportDataHeaderProps) {
  const importData = useImportDataStore('data')
  const balance = useBalanceStore('data', 'fetch') // todo support loading, error, sse
  const { submit, loading, error } = useRequest(importDataUrls.finish) // todo handle error

  const handleFinish = (revise = false) => {
    submit({ revise }, { id: importData.data?.id })
  }

  useEffect(() => {
    balance.fetch()
  }, [])

  const balances = useMemo(() => {
    const currencies = importData.data?.totals?.map((it) => it.currency) || []
    const result: Record<string, Amount> = {}
    balance.data
      ?.filter(
        (it) =>
          it.account.id === importData.data?.account.id && currencies.includes(it.amount.currency),
      )
      .forEach((it) => (result[it.amount.currency] = it.amount))
    return result
  }, [balance.data])

  return (
    <Stack orientation="horizontal" gap={4}>
      <Sse eventName={balanceEvents.root} listener={balance.fetch} />
      <DataPlaceholder dataFetched data={importData.data?.totals}>
        <div
          className={cn(
            'grid grid-cols-[repeat(3,minmax(120px,min-content))_min-content] gap-x-2 items-center grow',
          )}
        >
          <div>Operations</div>
          <div>Suggested</div>
          <div>Actual balance</div>
          <div />
          {importData.data?.totals?.map((it) => (
            <ImportDataTotalEntry
              key={it.currency}
              importDataId={importData.data?.id}
              currency={it.currency}
              operation={balances[it.currency]}
              suggested={it.suggested}
              actual={it.actual}
            />
          ))}
        </div>
      </DataPlaceholder>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Pointable>
            <Stack orientation="horizontal" center>
              <Typography variant="h2">{importData.data?.account?.name}</Typography>
              {!importData.data?.progress ? (
                <ValidityIcon
                  valid={importData.data?.valid}
                  message="Totals by import file doesn't mathced to totals in database with suggested records or actual balance is different"
                  collapseIfEmpty
                />
              ) : (
                <Spinner />
              )}
            </Stack>
          </Pointable>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleFinish()}>Finish</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFinish(true)}>Finish & revise</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Stack>
  )
}

interface ImportDataTotalEntryProps {
  importDataId?: string
  currency: string
  operation?: Amount
  suggested?: Amount
  actual?: Amount
}

function ImportDataTotalEntry({
  importDataId,
  currency,
  operation,
  suggested,
  actual,
}: ImportDataTotalEntryProps) {
  const { submit, loading, error } = useRequest(importDataUrls.actualBalance, {
    noErrorToast: true,
  })

  const balanceWithSuggestions = plus(operation, suggested)
  const delta = minus(actual, balanceWithSuggestions)

  const handleEditActualBalance = async () => {
    const value = await askText('Actual balance')
    const actualValue = +value
    if (!actualValue) {
      return
    }
    await submit(amount(actualValue, currency), { id: importDataId })
  }

  return (
    <>
      <AmountLabel amount={operation} />
      <AmountLabel amount={suggested} />
      <div className="flex gap-2 items-center" onClick={handleEditActualBalance}>
        <EditIcon size={16} />
        {loading ? (
          <Spinner className="w-4" />
        ) : error ? (
          <ErrorLabel error={error} />
        ) : actual ? (
          <AmountLabel amount={actual} />
        ) : null}
      </div>
      {actual && delta ? <AmountLabel amount={delta} className="text-red-500" /> : <div />}
    </>
  )
}
