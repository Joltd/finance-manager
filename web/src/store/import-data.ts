import { create } from "zustand";
import { createFetchStore, FetchStoreState, observable } from "@/store/common";
import { importDataUrls } from "@/api/import-data";
import { Reference } from "@/types/common";
import { ImportData, ImportDataOperation } from "@/types/import-data";
import { EntityPage } from "@/types/entity";

interface ImportDataStoreState {
  importDataList: FetchStoreState<Reference[]>
  importData: FetchStoreState<ImportData>
  accountList: FetchStoreState<Reference[]>
  operationList: FetchStoreState<EntityPage<ImportDataOperation>>
  newDialogOpened: boolean
  setNewDialogOpened: (opened: boolean) => void
  operationSheetOpened: boolean
  setOperationSheetOpened: (opened: boolean) => void
  entryId?: string
  setEntryId: (id?: string) => void
}

export const useImportDataStore = create<ImportDataStoreState>()((set, get) => {
  const importDataList = createFetchStore<Reference[]>(importDataUrls.root)
  const importData = createFetchStore<ImportData>(importDataUrls.id)
  const accountList = createFetchStore<Reference[]>(importDataUrls.account)
  const operationList = createFetchStore<EntityPage<ImportDataOperation>>(importDataUrls.operation)

  return {
    importDataList: observable(importDataList, set, 'importDataList'),
    importData: observable(importData, set, 'importData'),
    accountList: observable(accountList, set, 'accountList'),
    operationList: observable(operationList, set, 'operationList'),
    newDialogOpened: false,
    setNewDialogOpened: (opened: boolean) => set({ newDialogOpened: opened }),
    operationSheetOpened: false,
    setOperationSheetOpened: (opened: boolean) => set({operationSheetOpened: opened}),
    entryId: undefined,
    setEntryId: (id?: string) => set({entryId: id})
  }
})