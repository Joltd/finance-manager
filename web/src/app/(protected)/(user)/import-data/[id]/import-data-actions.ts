import { useRequest } from '@/hooks/use-request'
import { Amount } from '@/types/common/amount'
import { Operation } from '@/types/operation'
import { importDataUrls } from '@/api/import-data'
import { ImportDataDay, ImportDataParsingStatus } from '@/types/import-data'
import { useImportDataEntrySeekStore, useImportDataStore } from '@/store/import-data'
import { operationUrls } from '@/api/operation'

export function useImportDataActions() {
  const importData = useImportDataStore()
  const importDataEntries = useImportDataEntrySeekStore()
  const operation = useRequest(operationUrls.root)

  const actualBalanceRequest = useRequest<void, Amount, never, { id: string }>(
    importDataUrls.actualBalance,
  )

  const finishRequest = useRequest<void, never, never, { id: string }>(importDataUrls.finish)

  const calculateTotalRequest = useRequest<void, never, never, { id: string }>(
    importDataUrls.calculateTotal,
  )

  const unlinkRequest = useRequest<ImportDataDay[], { entryIds: string[] }, never, { id: string }>(
    importDataUrls.unlink,
  )

  const approveRequest = useRequest<ImportDataDay[], { entryIds: string[] }, never, { id: string }>(
    importDataUrls.approve,
  )

  const linkByIdRequest = useRequest<
    ImportDataDay[],
    { entryId: string; operationId: string },
    never,
    { id: string }
  >(importDataUrls.link)

  const linkRequest = useRequest<
    ImportDataDay[],
    Omit<Operation, 'raw'>,
    never,
    { id: string; entryId: string }
  >(importDataUrls.linkById)

  const loading =
    importData.loading ||
    importData.data?.parsingStatus !== ImportDataParsingStatus.DONE ||
    importDataEntries.loadingRefresh ||
    actualBalanceRequest.loading ||
    finishRequest.loading ||
    calculateTotalRequest.loading ||
    unlinkRequest.loading ||
    approveRequest.loading ||
    linkByIdRequest.loading ||
    linkRequest.loading ||
    operation.loading

  const error =
    actualBalanceRequest.error ??
    finishRequest.error ??
    calculateTotalRequest.error ??
    unlinkRequest.error ??
    approveRequest.error ??
    linkByIdRequest.error ??
    linkRequest.error ??
    operation.error

  const actualBalance = (id: string, balance: Amount) =>
    actualBalanceRequest.submit({ pathParams: { id }, body: balance })

  const finish = (id: string) => finishRequest.submit({ pathParams: { id } })

  const calculateTotal = (id: string) => calculateTotalRequest.submit({ pathParams: { id } })

  const unlink = (id: string, entryIds: string[]) =>
    unlinkRequest
      .submit({ pathParams: { id }, body: { entryIds } })
      .then(() => importDataEntries.refresh())

  const approve = (id: string, entryIds: string[]) =>
    approveRequest
      .submit({ pathParams: { id }, body: { entryIds } })
      .then(() => importDataEntries.refresh())

  const linkById = (id: string, entryId: string, operationId: string) =>
    linkByIdRequest
      .submit({ pathParams: { id }, body: { entryId, operationId } })
      .then(() => importDataEntries.refresh())

  const link = (id: string, entryId: string, operation: Omit<Operation, 'raw'>) =>
    linkRequest
      .submit({ pathParams: { id, entryId }, body: operation })
      .then(() => importDataEntries.refresh())

  const saveOperation = (body: Omit<Operation, 'raw'>) =>
    operation.submit({ body }).then(() => importDataEntries.refresh())

  return {
    loading,
    error,
    actualBalance,
    finish,
    calculateTotal,
    unlink,
    approve,
    linkById,
    link,
    saveOperation,
  }
}
