import { operationUrls } from '@/api/operation'
import { Operation } from '@/types/operation'
import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { useStoreSelect } from '@/hooks/use-store-select'

const operationListStore = createFetchStore<Operation[]>(operationUrls.root)

export const useOperationListStore = <K extends keyof FetchStoreState<Operation[]>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<Operation[]>, K>(operationListStore, ...fields)

//

const operationStore = createFetchStore<Operation>(operationUrls.id)

export const useOperationStore = <K extends keyof FetchStoreState<Operation>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Operation>, K>(operationStore, ...fields)
