import { Balance } from '@/types/balance'
import { balanceUrls } from '@/api/balance'
import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { useStoreSelect } from '@/hooks/use-store-select'

const balanceStore = createFetchStore<Balance[]>(balanceUrls.root)

export const useBalanceStore = <K extends keyof FetchStoreState<Balance[]>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Balance[]>, K>(balanceStore, ...fields)
