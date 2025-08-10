import { operationUrls } from '@/api/operation'
import { Operation, OperationGroup } from '@/types/operation'
import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { useStoreSelect } from '@/hooks/use-store-select'
import { createSelectionStore, SelectionStoreState } from '@/store/common/selection'

const operationListStore = createFetchStore<OperationGroup[]>(operationUrls.root)

export const useOperationListStore = <K extends keyof FetchStoreState<OperationGroup[]>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<OperationGroup[]>, K>(operationListStore, ...fields)

//

const operationStore = createFetchStore<Operation>(operationUrls.id)

export const useOperationStore = <K extends keyof FetchStoreState<Operation>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Operation>, K>(operationStore, ...fields)

//

const operationSelectionStore = createSelectionStore<Operation>((item) => item.id!!)

export const useOperationSelectionStore = <K extends keyof SelectionStoreState<Operation>>(
  ...fields: K[]
) => useStoreSelect(operationSelectionStore, ...fields)
