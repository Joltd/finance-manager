import { Operation, OperationType } from "@/types/operation";
import { AmountLabel } from "@/components/common/amount-label";
import { AccountLabel } from "@/components/common/account-label";
import { DateLabel } from "@/components/common/date-label";
import { OperationTypeIcon } from "@/components/common/operation-type-icon";
import { MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Account } from "@/types/account";

export interface OperationLabelProps {
  operation: Operation
  account?: Account
  showDate?: boolean
  variant?: 'filled'
  className?: string
}

const operationLabelVariants = cva(
  "flex items-center gap-2 min-w-2",
  {
    variants: {
      variant: {
        filled: "border rounded-sm bg-accent p-2 max-h-8 grow-0"
      }
    },
  }
)

export function OperationLabel({ operation, account, showDate, variant, className }: OperationLabelProps) {
  const withFrom = !account || account.id !== operation.accountFrom.id
  const withTo = !account || account.id !== operation.accountTo.id
  return (
    <div className={cn(operationLabelVariants({ variant }), className)}>
      <OperationTypeIcon type={operation.type} />
      {showDate && <DateLabel date={operation.date} />}
      <span className="flex items-center text-nowrap gap-1 min-w-[210]">
        <AmountLabel amount={operation.amountFrom} shorten />
        {operation.type === OperationType.EXCHANGE && (
          <>
            <MoveRight size="16" />
            <AmountLabel amount={operation.amountTo} shorten />
          </>
        )}
      </span>
      {withFrom && <AccountLabel account={operation.accountFrom} />}
      {withFrom && withTo && <MoveRight size="16" className="shrink-0" />}
      {withTo && <AccountLabel account={operation.accountTo} />}
    </div>
  )
}