import { AmountLabel } from '@/components/common/amount-label'
import { Fragment } from 'react'
import { EditIcon } from 'lucide-react'
import { amount, Amount } from '@/types/common'
import { cn } from '@/lib/utils'
import { ImportDataTotal } from '@/types/import-data'
import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'
import { askText } from '@/components/common/ask-text-dialog'

export interface ImportDataTotalsProps {
  importDataId: string
  totals?: ImportDataTotal[]
}

export function ImportDataTotals({ importDataId, totals = [] }: ImportDataTotalsProps) {
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
          operation={it.operation}
          parsed={it.parsed}
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
  const { submit, loading, error } = useRequest(importDataUrls.actualBalance) // todo use loading and error

  // todo instead parsed total there is necessary for amount during import process
  const balanceAfterImport = (operation?.value || 0) + (parsed?.value || 0)
  const delta = (actual?.value || 0) - balanceAfterImport

  const handleEditActualBalance = async () => {
    // todo pass current balance (?)
    const value = await askText('Actual balance')
    await submit(amount(+value, currency), { id: importDataId }) // todo handle parse error
  }

  return (
    <>
      {/*<CurrencyLabel currency={currency} />*/}
      {operation ? <AmountLabel amount={operation} /> : <div />}
      {parsed ? <AmountLabel amount={parsed} /> : <div />}
      <div className="flex gap-2 items-center" onClick={handleEditActualBalance}>
        <EditIcon size={16} />
        {actual && <AmountLabel amount={actual} />}
      </div>
      {actual && delta !== 0 ? (
        <AmountLabel amount={{ value: delta, currency }} className="text-red-500" />
      ) : (
        <div />
      )}
    </>
  )
}
