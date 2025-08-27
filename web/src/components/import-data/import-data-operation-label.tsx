import { OperationType } from '@/types/operation'
import { Account } from '@/types/account'
import { OperationTypeIcon } from '@/components/common/operation-type-icon'
import { OperationAmountLabel } from '@/components/common/operation-amount-label'
import { AccountLabel } from '@/components/common/account-label'
import { cn } from '@/lib/utils'
import { Amount } from '@/types/common/amount'
import React from 'react'

export interface ImportDataOperationLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  type: OperationType
  accountFrom?: Account
  amountFrom: Amount
  amountTo: Amount
  accountTo?: Account
  relatedAccount: Account
  className?: string
  amountFieldTight?: boolean
}

export const ImportDataOperationLabel = React.forwardRef<
  HTMLDivElement,
  ImportDataOperationLabelProps
>(
  (
    {
      type,
      accountFrom,
      amountFrom,
      accountTo,
      amountTo,
      relatedAccount,
      className,
      amountFieldTight,
    }: ImportDataOperationLabelProps,
    ref,
  ) => {
    let account
    if (relatedAccount.id !== accountFrom?.id) {
      account = accountFrom
    } else if (relatedAccount.id !== accountTo?.id) {
      account = accountTo
    }

    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)}>
        <OperationTypeIcon type={type} />
        <OperationAmountLabel
          type={type}
          from={amountFrom}
          to={amountTo}
          className={cn(amountFieldTight ? 'min-w-26' : 'min-w-44')}
        />
        <AccountLabel account={account} className="min-w-0" />
      </div>
    )
  },
)
