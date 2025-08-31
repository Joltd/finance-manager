import { importDataUrls } from '@/api/import-data'
import { ImportData, ImportDataEntry, ImportDataEntryGroup } from '@/types/import-data'
import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { useStoreSelect } from '@/hooks/use-store-select'
import { createSelectionStore, SelectionStoreState } from '@/store/common/selection'
import { Operation } from '@/types/operation'
import { Reference } from '@/types/common/reference'
import { createStore } from 'zustand/index'

const importDataListStore = createFetchStore<Reference[]>(importDataUrls.root)

export const useImportDataListStore = <K extends keyof FetchStoreState<Reference[]>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<Reference[]>, K>(importDataListStore, ...fields)

//

const importDataStore = createFetchStore<ImportData>(importDataUrls.id)

export const useImportDataStore = <K extends keyof FetchStoreState<ImportData>>(...fields: K[]) =>
  useStoreSelect(importDataStore, ...fields)

//

const importDataEntryListStore = createFetchStore<ImportDataEntryGroup[]>(importDataUrls.entry)

export const useImportDataEntryListStore = <
  K extends keyof FetchStoreState<ImportDataEntryGroup[]>,
>(
  ...fields: K[]
) => useStoreSelect(importDataEntryListStore, ...fields)

//

const importDataOperationSelectionStore = createSelectionStore<Operation>((item) => item.id!!)

export const useImportDataOperationSelectionStore = <
  K extends keyof SelectionStoreState<Operation>,
>(
  ...fields: K[]
) => useStoreSelect(importDataOperationSelectionStore, ...fields)

//

const importDataEntrySelectionStore = createSelectionStore<ImportDataEntry>((item) => item.id!!)

export const useImportDataEntrySelectionStore = <
  K extends keyof SelectionStoreState<ImportDataEntry>,
>(
  ...fields: K[]
) => useStoreSelect(importDataEntrySelectionStore, ...fields)
