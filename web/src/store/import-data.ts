import { create } from "zustand";
import { createFetchStore, FetchStoreState, observable } from "@/store/common";
import { importDataUrls } from "@/api/import-data";
import { Reference } from "@/types/common";
import { ImportData, ImportDataOperation } from "@/types/import-data";
import { EntityPage } from "@/types/entity";
import { createOpenStore, OpenStoreState } from "@/store/open";

interface ImportDataStoreState {
  importDataList: FetchStoreState<Reference[]>
  importData: FetchStoreState<ImportData>
  accountList: FetchStoreState<Reference[]>
  operationList: FetchStoreState<EntityPage<ImportDataOperation>>
  newDialog: OpenStoreState
  operationSheet: OpenStoreState
}

export const useImportDataStore = create<ImportDataStoreState>()((set, get) => {
  const importDataList = createFetchStore<Reference[]>(importDataUrls.root)
  const importData = createFetchStore<ImportData>(importDataUrls.id)
  const accountList = createFetchStore<Reference[]>(importDataUrls.account)
  const operationList = createFetchStore<EntityPage<ImportDataOperation>>(importDataUrls.operation)
  const newDialog = createOpenStore()
  const operationSheet = createOpenStore()

  return {
    importDataList: observable(importDataList, set, 'importDataList'),
    importData: observable(importData, set, 'importData'),
    accountList: observable(accountList, set, 'accountList'),
    operationList: observable(operationList, set, 'operationList'),
    newDialog: observable(newDialog, set, 'newDialog'),
    operationSheet: observable(operationSheet, set, 'operationSheet'),
  }
})