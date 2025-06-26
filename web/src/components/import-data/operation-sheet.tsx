import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useImportDataStore } from "@/store/import-data";
import { OperationLabel } from "@/components/common/operation-label";
import { useEffect } from "react";
import { GroupedContent, ListGroup } from "@/components/common/grouped-content";
import { Filter } from "@/components/common/filter/filter";
import { DateFilter } from "@/components/common/filter/date-filter";
import { ReferenceFilter } from "@/components/common/filter/reference-filter";

export function OperationSheet() {
  const { importData, operationList, operationSheet } = useImportDataStore()

  useEffect(() => {
    if (!operationSheet.entryId) {
      return
    }

    operationList.updateQueryParams({ entryId: operationSheet.entryId })
    operationList.fetch()
  }, [operationSheet.entryId]);

  useEffect(() => {
    return () => {
      operationSheet.setEntryId(undefined)
    }
  }, []);

  return (
    <Sheet open={operationSheet.opened} onOpenChange={operationSheet.setOpened}>
      <SheetContent className="!max-w-[800px] w-[800px]">
        <SheetHeader>
          <SheetTitle>Operations</SheetTitle>
        </SheetHeader>
        <Filter>
          <DateFilter id="date" label="Date" />
          <ReferenceFilter id="account" label="Account" />
        </Filter>
        <GroupedContent
          items={operationList.data?.records}
          getGroup={(it) => it.date}
          renderGroup={(group, items, index) => (
            <ListGroup
              group={group}
              items={items}
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
              renderGroup={(group) => (<div>{group}</div>)}
            />
          )}
        />
      </SheetContent>
    </Sheet>
  )
}