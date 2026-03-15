import { useRequest } from '@/hooks/use-request'
import { Amount } from '@/types/common/amount'
import { importDataUrls } from '@/api/import-data'

export function useImportDataActions() {
  const actualBalanceRequest = useRequest<void, Amount, never, { id: string }>(
    importDataUrls.actualBalance,
  )

  const finishRequest = useRequest<void, never, never, { id: string }>(importDataUrls.finish)

  const calculateTotalRequest = useRequest<void, never, never, { id: string }>(
    importDataUrls.calculateTotal,
  )

  const unlinkRequest = useRequest<void, { entryIds: string[] }, never, { id: string }>(
    importDataUrls.unlink,
  )

  const approveRequest = useRequest<void, { entryIds: string[] }, never, { id: string }>(
    importDataUrls.approve,
  )

  const loading =
    actualBalanceRequest.loading ||
    finishRequest.loading ||
    calculateTotalRequest.loading ||
    unlinkRequest.loading ||
    approveRequest.loading

  const error =
    actualBalanceRequest.error ??
    finishRequest.error ??
    calculateTotalRequest.error ??
    unlinkRequest.error ??
    approveRequest.error

  const actualBalance = (id: string, balance: Amount) =>
    actualBalanceRequest.submit({ pathParams: { id }, body: balance })

  const finish = (id: string) => finishRequest.submit({ pathParams: { id } })

  const calculateTotal = (id: string) => calculateTotalRequest.submit({ pathParams: { id } })

  const unlink = (id: string, entryIds: string[]) =>
    unlinkRequest.submit({ pathParams: { id }, body: { entryIds } })

  const approve = (id: string, entryIds: string[]) =>
    approveRequest.submit({ pathParams: { id }, body: { entryIds } })

  return {
    loading,
    error,
    actualBalance,
    finish,
    calculateTotal,
    unlink,
    approve,
  }
}
