import { useRequest } from '@/hooks/use-request'
import { Amount } from '@/types/common/amount'
import { Operation } from '@/types/operation'
import { importDataUrls } from '@/api/import-data'
import { ImportDataDay } from '@/types/import-data'
import { useImportDataEntrySeekStore } from '@/store/import-data'

export function useImportDataActions() {
  const { patchData } = useImportDataEntrySeekStore()

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
    Operation,
    never,
    { id: string; entryId: string }
  >(importDataUrls.linkById)

  const loading =
    actualBalanceRequest.loading ||
    finishRequest.loading ||
    calculateTotalRequest.loading ||
    unlinkRequest.loading ||
    approveRequest.loading ||
    linkByIdRequest.loading ||
    linkRequest.loading

  const error =
    actualBalanceRequest.error ??
    finishRequest.error ??
    calculateTotalRequest.error ??
    unlinkRequest.error ??
    approveRequest.error ??
    linkByIdRequest.error ??
    linkRequest.error

  const actualBalance = (id: string, balance: Amount) =>
    actualBalanceRequest.submit({ pathParams: { id }, body: balance })

  const finish = (id: string) => finishRequest.submit({ pathParams: { id } })

  const calculateTotal = (id: string) => calculateTotalRequest.submit({ pathParams: { id } })

  const unlink = (id: string, entryIds: string[]) =>
    unlinkRequest.submit({ pathParams: { id }, body: { entryIds } }).then((days) => patchData(days))

  const approve = (id: string, entryIds: string[]) =>
    approveRequest
      .submit({ pathParams: { id }, body: { entryIds } })
      .then((days) => patchData(days))

  const linkById = (id: string, entryId: string, operationId: string) =>
    linkByIdRequest
      .submit({ pathParams: { id }, body: { entryId, operationId } })
      .then((days) => patchData(days))

  const link = (id: string, entryId: string, operation: Operation) =>
    linkRequest
      .submit({ pathParams: { id, entryId }, body: operation })
      .then((days) => patchData(days))

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
  }
}
