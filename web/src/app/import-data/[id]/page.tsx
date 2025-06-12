'use client'
import { imports } from "@/types/stub";
import { ImportDataEntryRow } from "@/components/import-data/import-data-entry-row";
import { ImportDataInfo } from "@/components/import-data/import-data-info";
import { ImportDataToolbar } from "@/components/import-data/import-data-toolbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNotificationStore } from "@/store/notification";
import { useImportDataStore } from "@/store/import-data";
import { PatchListener } from "@/components/common/patch-listener";
import { useEffect } from "react";
import { useParams } from "next/navigation";


export default function Page() {
  const params = useParams()
  const { importData } = useImportDataStore()

  useEffect(() => {
    importData.updatePathParams({ id: params.id })
    importData.fetch()
  }, []);

  return (
    <>

      {/*<PatchListener fetchStore={importData} eventName={'assad'} />*/}
      {/*<div className="grid grid-cols-[1fr_200px] grid-rows-[min-content_1fr] min-w-4xl w-full h-full gap-8 overflow-hidden">*/}
      {/*  <ImportDataToolbar />*/}
      <div className="flex flex-col row-start-2 overflow-x-hidden overflow-y-auto scrollbar-hide">
        {importData.data?.entries?.map((it) => (
          <ImportDataEntryRow key={it.id} account={importData.data?.account} entry={it} />
        ))}
      </div>
      {/*  <ImportDataInfo className="row-span-2" />*/}
      {/*</div>*/}
      {/*<Sheet>*/}
      {/*  <SheetContent>*/}
      {/*    <SheetHeader>*/}
      {/*      <SheetTitle></SheetTitle>*/}
      {/*    </SheetHeader>*/}
      {/*  </SheetContent>*/}
      {/*</Sheet>*/}
    </>
  )
}