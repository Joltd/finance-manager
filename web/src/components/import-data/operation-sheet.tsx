import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "../ui/sheet";
import { useImportDataStore } from "@/store/import-data";
import { OperationLabel } from "@/components/common/operation-label";
import { useEffect } from "react";
import { GroupedList } from "@/components/common/grouped-list";
import { Filter } from "@/components/common/filter/filter";
import { DateFilter } from "@/components/common/filter/date-filter";
import { ReferenceFilter } from "@/components/common/filter/reference-filter";

export function OperationSheet() {
  const { importData, operationList, operationSheetOpened, setOperationSheetOpened, entryId, setEntryId } = useImportDataStore()

  useEffect(() => {
    if (!entryId) {
      return
    }

    operationList.updateQueryParams({ entryId })
    operationList.fetch()
  }, [entryId]);

  useEffect(() => {
    return () => {
      setEntryId(undefined)
    }
  }, []);

  return (
    <Sheet open={operationSheetOpened} onOpenChange={setOperationSheetOpened}>
      <SheetContent className="!max-w-[800px] w-[800px]">
        <SheetHeader>
          <SheetTitle>Operations</SheetTitle>
        </SheetHeader>
        <Filter>
          <DateFilter field="date" label="Date" />
          <ReferenceFilter field="account" label="Account" />
        </Filter>
        <GroupedList
          items={operationList.data?.records}
          groupKey="date"
          renderItem={(it) => (
            <div className="flex items-center shrink-0 h-10 gap-2">
              <OperationLabel
                key={it.id}
                type={it.type}
                amountFrom={it.amountFrom}
                accountFrom={it.accountFrom}
                amountTo={it.amountTo}
                accountTo={it.accountTo}
                relatedAccount={importData.data?.account}
              />
            </div>
          )}
          renderGroup={(it) => <div>{it}</div>}
          className="p-4"
        />
      </SheetContent>
    </Sheet>
  )
}