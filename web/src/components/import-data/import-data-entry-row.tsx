import { ImportDataEntry } from "@/types/import-data";
import { OperationLabel } from "@/components/common/operation-label";
import { ImportDataParsedEntryLabel } from "@/components/import-data/import-data-parsed-entry-label";
import { TriangleAlert, Database, CheckCheck, CircleDashed } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ImportDataEntryRowProps {
  entry: ImportDataEntry
}

export function ImportDataEntryRow({ entry }: ImportDataEntryRowProps) {
  return (
    <div className={cn("flex items-center shrink-0 h-10 gap-2", entry.hidden && "opacity-30")}>

      <Checkbox />
      {!!entry.issues.length ? (
        <TriangleAlert size={20} className="text-yellow-500 shrink-0" />
      ) : (
        <CircleDashed size={16} className="shrink-0 text-muted w-5" />
      )}
      {!!entry.persisted?.length ? (
        <CheckCheck size={20} className="shrink-0 text-green-500" />
      ) : (
        <CircleDashed size={16} className="shrink-0 text-muted w-5" />
      )}
      {entry.suggested ? <OperationLabel operation={entry.suggested} variant="filled" className="w-[48rem]" />
        : entry.parsed ? (<ImportDataParsedEntryLabel entry={entry.parsed} />)
          : entry.raw ? <div className="whitespace-nowrap">{entry.raw}</div>
            : null}
    </div>
  )
}