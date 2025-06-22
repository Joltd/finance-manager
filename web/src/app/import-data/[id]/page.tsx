'use client'
import { useImportDataStore } from "@/store/import-data";
import { useParams } from "next/navigation";
import { OperationSheet } from "@/components/import-data/operation-sheet";
import { ImportDataEntryBrowser } from "@/components/import-data/import-data-entry-browser";
import { PatchListener } from "@/components/common/patch-listener";

export default function Page() {
  const params = useParams()
  const { importData } = useImportDataStore()

  return (
    <>
      {params.id && (
        <PatchListener fetchStore={importData} eventName={`importData-${params.id}`} />
      )}
      {/*<div className="grid grid-cols-[1fr_200px] grid-rows-[min-content_1fr] min-w-4xl w-full h-full gap-8 overflow-hidden">*/}
      {/*  <ImportDataToolbar />*/}
      {params.id && (
        <ImportDataEntryBrowser id={params.id as string} />
      )}
      <OperationSheet />
      {/*  <ImportDataInfo className="row-span-2" />*/}
      {/*</div>*/}
    </>
  )
}