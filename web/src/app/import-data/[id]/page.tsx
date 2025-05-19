import { ScrollArea } from "@/components/ui/scroll-area";
import { imports } from "@/types/stub";
import { ImportDataEntryRow } from "@/components/import-data/import-data-entry-row";
import { ImportDataInfo } from "@/components/import-data/import-data-info";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { ImportDataToolbar } from "@/components/import-data/import-data-toolbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Page() {
  return (
    <>
      <div className="grid grid-cols-[1fr_200px] grid-rows-[min-content_1fr] min-w-4xl w-full h-full gap-8 overflow-hidden">
        <ImportDataToolbar />
        <div className="flex flex-col row-start-2 overflow-x-hidden overflow-y-auto scrollbar-hide">
          {imports.map((item) => <ImportDataEntryRow key={item.id} entry={item} />)}
          {imports.map((item) => <ImportDataEntryRow key={item.id} entry={item} />)}
        </div>
        <ImportDataInfo className="row-span-2" />
      </div>
      <Sheet open={true}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  )
}