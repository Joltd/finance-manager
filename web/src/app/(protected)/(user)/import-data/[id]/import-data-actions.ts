import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'
import { ImportDataParsingStatus } from '@/types/import-data'
import { useImportDataEntrySeekStore, useImportDataStore } from '@/store/import-data'

export function useImportDataActions() {
  const importData = useImportDataStore()
  const importDataEntries = useImportDataEntrySeekStore()

  const commitRequest = useRequest<void, never, never, { id: string }>(importDataUrls.commit)

  const loading =
    importData.loading ||
    importData.data?.parsingStatus !== ImportDataParsingStatus.DONE ||
    importDataEntries.loadingLoad ||
    commitRequest.loading

  const error = commitRequest.error

  const commit = (id: string) => commitRequest.submit({ pathParams: { id } })

  return {
    loading,
    error,
    commit,
  }
}
