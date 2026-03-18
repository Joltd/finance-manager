import type { Amount } from '@/types/common/amount'
import { isNegative, isPositive, toDisplayString } from '@/types/common/amount'
import { cn } from '@/lib/utils'

type AmountVariant = 'default' | 'income' | 'expense' | 'balance'

interface AmountLabelProps {
  amount?: Amount
  variant?: AmountVariant
  className?: string
}

function getColorClass(amount: Amount, variant: AmountVariant): string {
  switch (variant) {
    case 'income':
      return 'text-green-600 dark:text-green-400'
    case 'expense':
      return 'text-destructive'
    case 'balance':
      if (isPositive(amount)) return 'text-green-600 dark:text-green-400'
      if (isNegative(amount)) return 'text-destructive'
      return 'text-muted-foreground'
    default:
      return 'text-muted-foreground'
  }
}

export function AmountLabel({ amount, variant = 'default', className }: AmountLabelProps) {
  if (!amount) {
    return (
      <span className={cn('text-xs font-mono tabular-nums text-muted-foreground', className)}>
        —
      </span>
    )
  }

  const prefix = variant === 'balance' && isPositive(amount) ? '+' : ''

  return (
    <span
      className={cn(
        'text-xs font-mono tabular-nums px-1.5 py-0.5 rounded bg-muted',
        getColorClass(amount, variant),
        className,
      )}
    >
      {prefix}
      {toDisplayString(amount)}
    </span>
  )
}
