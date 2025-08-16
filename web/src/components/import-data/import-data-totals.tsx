import { AmountLabel } from '@/components/common/amount-label'
import { Fragment, useEffect } from 'react'
import { EditIcon } from 'lucide-react'
import { amount, Amount, minus, plus } from '@/types/common'
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
  const balance = useBalanceStore('data', 'fetch') // todo support loading, error, sse

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
      <div>Suggested</div>
      <div>Actual balance</div>
      <div />
      {totals.map((it) => (
        <ImportDataTotalEntry
          key={it.currency}
          importDataId={importDataId}
          currency={it.currency}
          operation={getCurrentBalance(it.currency)}
          suggested={it.suggested}
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
