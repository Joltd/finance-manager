import { operationUrls } from '@/api/operation'
import { Operation, OperationGroup } from '@/types/operation'
import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { useStoreSelect } from '@/hooks/use-store-select'
import { createSelectionStore, SelectionStoreState } from '@/store/common/selection'
import { createSeekStore, SeekStoreState } from '@/store/common/seek'
import { formatDate } from '@/lib/date'

const operationListStore = createSeekStore<string, OperationGroup>(
  formatDate(Date())!!,
  (data) => data.date,
  operationUrls.root,
)

export const useOperationListStore = <K extends keyof SeekStoreState<string, OperationGroup>>(
  ...fields: K[]
) => useStoreSelect<SeekStoreState<string, OperationGroup>, K>(operationListStore, ...fields)

//

const operationStore = createFetchStore<Operation>(operationUrls.id)

export const useOperationStore = <K extends keyof FetchStoreState<Operation>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Operation>, K>(operationStore, ...fields)

//

const operationSelectionStore = createSelectionStore<Operation>((item) => item.id!!)

export const useOperationSelectionStore = <K extends keyof SelectionStoreState<Operation>>(
  ...fields: K[]
) => useStoreSelect(operationSelectionStore, ...fields)
