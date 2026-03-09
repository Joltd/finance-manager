import { createFetchStore } from '@/store/common/fetch'
import { createSeekStore } from '@/store/common/seek'
import { importDataUrls } from '@/api/import-data'
import { ImportData, ImportDataDay } from '@/types/import-data'
import { Reference } from '@/types/common/reference'

export const useImportDataListStore = createFetchStore<Reference[]>(importDataUrls.root)

export const useImportDataStore = createFetchStore<ImportData, unknown, unknown, { id: string }>(
  importDataUrls.id,
)

export const useImportDataEntrySeekStore = createSeekStore<
  ImportDataDay,
  string,
  unknown,
  unknown,
  { id: string }
>(importDataUrls.entry, (day) => day.date)
