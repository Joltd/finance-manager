import { Button } from "@/components/ui/button";
import { useImportDataStore } from "@/store/import-data";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCheck, CircleDashed, Search, TriangleAlert } from "lucide-react";
import { OperationLabel } from "@/components/common/operation-label";
import { useEffect } from "react";
import { StateBadge } from "@/components/common/state-badge";
import { GroupedContent, ListGroup } from "@/components/common/grouped-content";

export interface ImportDataEntryBrowserProps {
  id: string
}

export function ImportDataEntryBrowser({ id }: ImportDataEntryBrowserProps) {
  const { importData, operationSheet } = useImportDataStore()

  useEffect(() => {
    importData.updatePathParams({ id })
    importData.fetch()
  }, []);

  const handleSearchOperation = (entryId: string) => {
    operationSheet.setEntryId(entryId)
    operationSheet.setOpened(true)
  }

  return (
    <GroupedContent
      items={importData.data?.entries}
      getGroup={(it) => it.date}
      renderGroup={(group, items, index) => (
        <ListGroup
          group={group}
          items={items}
          renderGroup={(group) => <div>{group}</div>}
          renderItem={(it) => (
            <div className={cn("flex items-center shrink-0 h-10 gap-2", it.hidden && "opacity-30")}>
              <Checkbox />
              <StateBadge condition={!!it.issues?.length} >
                <TriangleAlert size={20} className="text-yellow-500 shrink-0" />
              </StateBadge>
              <StateBadge condition={!!it.operationId}>
                <CheckCheck size={20} className="shrink-0 text-green-500" />
              </StateBadge>
              {it.type && (
                <OperationLabel
                  type={it.type}
                  amountFrom={it.amountFrom!!}
                  accountFrom={it.accountFrom!!}
                  amountTo={it.amountTo!!}
                  accountTo={it.accountTo!!}
                  relatedAccount={importData.data?.account}
                />
              )}
              <Button size="sm" variant="secondary" onClick={() => handleSearchOperation(it.id)}>
                <Search />
              </Button>
            </div>
          )}
        />
      )}
    />
  )
}