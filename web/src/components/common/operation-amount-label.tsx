import { OperationType } from '@/types/operation'
import { AmountLabel } from '@/components/common/amount-label'
import { MoveRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Amount } from '@/types/common/amount'

export interface OperationAmountLabelProps {
  type: OperationType
  from: Amount
  to: Amount
  className?: string
}

export function OperationAmountLabel({ type, from, to, className }: OperationAmountLabelProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <AmountLabel amount={from} shorten className="shrink min-w-10" />
      {type === OperationType.EXCHANGE && (
        <>
          <MoveRight size="16" className="shrink-0" />
          <AmountLabel amount={to} shorten className="shrink min-w-10" />
        </>
      )}
    </div>
  )
}
