import { ImportDataParsedEntry } from "@/types/import-data";
import { OperationTypeIcon } from "@/components/common/operation-type-icon";
import { AmountLabel } from "@/components/common/amount-label";
import { AccountLabel } from "@/components/common/account-label";
import { MoveRight } from "lucide-react";
import { OperationType } from "@/types/operation";

export interface ImportDataParsedEntryLabelProps {
  entry: ImportDataParsedEntry
}

export function ImportDataParsedEntryLabel({ entry }: ImportDataParsedEntryLabelProps) {
  return (
    <div className="flex items-center gap-2 px-2 w-[48rem]">
      <OperationTypeIcon type={entry.type} />
      <span className="flex items-center text-nowrap gap-1 min-w-[210]">
        <AmountLabel amount={entry.amountFrom} shorten />
        {entry.type === OperationType.EXCHANGE && (
          <>
            <MoveRight size="16" />
            <AmountLabel amount={entry.amountTo} shorten />
          </>
        )}
      </span>
      <AccountLabel account={entry.accountFrom} />
      <MoveRight size="16" />
      <AccountLabel account={entry.accountTo} />
    </div>
  )
}