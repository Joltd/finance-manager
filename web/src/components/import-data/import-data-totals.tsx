import { AmountLabel } from '@/components/common/amount-label'
import { Fragment, useEffect } from 'react'
import { EditIcon } from 'lucide-react'
import { amount, Amount } from '@/types/common'
import { cn } from '@/lib/utils'
import { ImportDataTotal } from '@/types/import-data'
import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'
import { askText } from '@/components/common/ask-text-dialog'
import { useBalanceStore } from '@/store/balance'
import { Account } from '@/types/account'
import { Spinner } from '@/components/ui/spinner'
import { ErrorLabel } from '@/components/common/error-label'

export interface ImportDataTotalsProps {
  importDataId: string
  account: Account
  totals?: ImportDataTotal[]
}

export function ImportDataTotals({ importDataId, account, totals = [] }: ImportDataTotalsProps) {
  const balance = useBalanceStore('data', 'fetch')

  useEffect(() => {
    balance.fetch()
  }, [])

  const getCurrentBalance = (currency: string): Amount | undefined =>
    balance.data?.find((it) => it.account.id === account.id && it.amount.currency === currency)
      ?.amount

  return !totals?.length ? (
    <div className="text-muted">No totals</div>
  ) : (
    <div
      className={cn(
        'grid grid-cols-[repeat(3,minmax(120px,min-content))_min-content] gap-x-2 items-center',
      )}
    >
      <div>Operations</div>
      <div>From import</div>
      <div>Actual balance</div>
      <div />
      {totals.map((it) => (
        <ImportDataTotalEntry
          key={it.currency}
          importDataId={importDataId}
          currency={it.currency}
          operation={getCurrentBalance(it.currency)}
          // parsed={it.parsed}
          actual={it.actual}
        />
      ))}
    </div>
  )
}

interface ImportDataTotalEntryProps {
  importDataId: string
  currency: string
  operation?: Amount
  parsed?: Amount
  actual?: Amount
}

function ImportDataTotalEntry({
  importDataId,
  currency,
  operation,
  parsed,
  actual,
}: ImportDataTotalEntryProps) {
  const { submit, loading, error } = useRequest(importDataUrls.actualBalance)

  // todo instead parsed total there is necessary for amount during import process
  const balanceAfterImport = (operation?.value || 0) + (parsed?.value || 0)
  const delta = (actual?.value || 0) - balanceAfterImport

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
      {/*<CurrencyLabel currency={currency} />*/}
      {operation ? <AmountLabel amount={operation} /> : <div />}
      {parsed ? <AmountLabel amount={parsed} /> : <div />}
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
      {actual && delta !== 0 ? (
        <AmountLabel amount={{ value: delta, currency }} className="text-red-500" />
      ) : (
        <div />
      )}
    </>
  )
}
