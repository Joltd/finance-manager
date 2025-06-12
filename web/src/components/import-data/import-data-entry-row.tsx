import { ImportDataEntry } from "@/types/import-data";
import { OperationLabel } from "@/components/common/operation-label";
import { ImportDataParsedEntryLabel } from "@/components/import-data/import-data-parsed-entry-label";
import { TriangleAlert, Database, CheckCheck, CircleDashed, MoveRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OperationTypeIcon } from "@/components/common/operation-type-icon";
import { AmountLabel } from "@/components/common/amount-label";
import { OperationType } from "@/types/operation";
import { AccountLabel } from "@/components/common/account-label";
import { Account } from "@/types/account";

export interface ImportDataEntryRowProps {
  account?: Account
  entry: ImportDataEntry
}

export function ImportDataEntryRow({ account, entry }: ImportDataEntryRowProps) {
  return (
    <div className={cn("flex items-center shrink-0 h-10 gap-2", entry.hidden && "opacity-30")}>

      <Checkbox />
      {!!entry.issues?.length ? (
        <TriangleAlert size={20} className="text-yellow-500 shrink-0" />
      ) : (
        <CircleDashed size={16} className="shrink-0 text-muted w-5" />
      )}
      {/*{!!entry.persisted?.length ? (*/}
      {/*  <CheckCheck size={20} className="shrink-0 text-green-500" />*/}
      {/*) : (*/}
      {/*  <CircleDashed size={16} className="shrink-0 text-muted w-5" />*/}
      {/*)}*/}

      {entry.type && (
        <OperationLabel
          type={entry.type}
          amountFrom={entry.amountFrom!!}
          accountFrom={entry.accountFrom!!}
          amountTo={entry.amountTo!!}
          accountTo={entry.accountTo!!}
          relatedAccount={account}
        />
      )}
    </div>
  )
}