import { CurrencyLabel } from '@/components/common/currency-label'
import { cn } from '@/lib/utils'
import { ValueLabel } from '@/components/common/value-label'

import { Amount } from '@/types/common/amount'

export interface AmountLabelProps {
  amount?: Amount
  shorten?: boolean
  className?: string
}

export function AmountLabel({ amount, shorten, className }: AmountLabelProps) {
  const value = (amount?.value || 0) / 10000

  return (
    <div className={cn('flex items-center gap-1 min-w-10', className)}>
      {amount && (
        <>
          <ValueLabel value={value} shorten={shorten} />
          <CurrencyLabel currency={amount.currency} />
        </>
      )}
    </div>
  )
}
