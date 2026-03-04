import type { Amount } from '@/types/common/amount'
import { toDisplayString } from '@/types/common/amount'
import { cn } from '@/lib/utils'

interface AmountLabelProps {
  amount: Amount
  className?: string
}

export function AmountLabel({ amount, className }: AmountLabelProps) {
  return (
    <span
      className={cn(
        'text-xs font-mono tabular-nums px-1.5 py-0.5 rounded bg-muted',
        amount.value < 0 ? 'text-destructive' : 'text-muted-foreground',
        className,
      )}
    >
      {toDisplayString(amount)}
    </span>
  )
}
