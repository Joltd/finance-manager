import { create } from "zustand";
import { createFetchStore, FetchStoreState, observable } from "@/store/common";
import { importDataUrls } from "@/api/import-data";
import { Reference } from "@/types/common";
import { ImportData } from "@/types/import-data";

interface ImportDataStoreState {
  importDataList: FetchStoreState<Reference[]>
  importData: FetchStoreState<ImportData>
  accountList: FetchStoreState<Reference[]>
  newDialogOpened: boolean
  setNewDialogOpened: (opened: boolean) => void
}

export const useImportDataStore = create<ImportDataStoreState>()((set, get) => {
  const importDataList = createFetchStore<Reference[]>(importDataUrls.root)
  const importData = createFetchStore<ImportData>(importDataUrls.id)
  const accountList = createFetchStore<Reference[]>(importDataUrls.account)

  return {
    importDataList: observable(importDataList, set, 'importDataList'),
    importData: observable(importData, set, 'importData'),
    accountList: observable(accountList, set, 'accountList'),
    newDialogOpened: false,
    setNewDialogOpened: (opened: boolean) => set({ newDialogOpened: opened })
  }
})