import { OperationType } from '@/types/operation'
import { AmountLabel } from '@/components/common/amount-label'
import { AccountLabel } from '@/components/common/account-label'
import { DateLabel } from '@/components/common/date-label'
import { OperationTypeIcon } from '@/components/common/operation-type-icon'
import { MoveRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'
import { Account } from '@/types/account'

import { Amount } from '@/types/common'

export interface OperationLabelProps {
  date?: string
  type: OperationType
  amountFrom: Amount
  accountFrom?: Account
  amountTo: Amount
  accountTo?: Account
  relatedAccount?: Account
  variant?: 'filled'
  className?: string
}

const variants = cva('flex items-center gap-2 min-w-2', {
  variants: {
    variant: {
      filled: 'border rounded-sm bg-accent p-2 max-h-8 grow-0',
    },
  },
})

export function OperationLabel({
  date,
  type,
  amountFrom,
  accountFrom,
  amountTo,
  accountTo,
  relatedAccount,
  variant,
  className,
}: OperationLabelProps) {
  const withFrom = accountFrom?.id !== relatedAccount?.id
  const withTo = accountTo?.id !== relatedAccount?.id
  return (
    <div className={cn(variants({ variant }), className)}>
      <OperationTypeIcon type={type} />
      {date && <DateLabel date={date} className="min-w-40" />}
      <span className="flex items-center text-nowrap gap-1 min-w-[210]">
        <AmountLabel amount={amountFrom} shorten />
        {type === OperationType.EXCHANGE && (
          <>
            <MoveRight size="16" />
            <AmountLabel amount={amountTo} shorten />
          </>
        )}
      </span>
      {withFrom && <AccountLabel account={accountFrom} />}
      {withFrom && withTo && <MoveRight size="16" className="shrink-0" />}
      {withTo && <AccountLabel account={accountTo} />}
    </div>
  )
}
