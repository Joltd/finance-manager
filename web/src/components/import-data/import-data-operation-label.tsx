import { OperationType } from '@/types/operation'
import { Amount } from '@/types/common'
import { Account } from '@/types/account'
import { OperationTypeIcon } from '@/components/common/operation-type-icon'
import { OperationAmountLabel } from '@/components/common/operation-amount-label'
import { AccountLabel } from '@/components/common/account-label'
import { cn } from '@/lib/utils'

export interface ImportDataOperationLabelProps {
  type: OperationType
  accountFrom?: Account
  amountFrom: Amount
  amountTo: Amount
  accountTo?: Account
  relatedAccount: Account
  className?: string
  amountFieldTight?: boolean
}

export function ImportDataOperationLabel({
  type,
  accountFrom,
  amountFrom,
  accountTo,
  amountTo,
  relatedAccount,
  className,
  amountFieldTight,
}: ImportDataOperationLabelProps) {
  let account
  if (relatedAccount.id !== accountFrom?.id) {
    account = accountFrom
  } else if (relatedAccount.id !== accountTo?.id) {
    account = accountTo
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
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
}
