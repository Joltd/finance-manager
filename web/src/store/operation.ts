import { createFetchStore } from '@/store/common/fetch'
import { createSeekStore } from '@/store/common/seek'
import { operationUrls } from '@/api/operation'
import { Operation, OperationFilter, OperationGroup } from '@/types/operation'

export const useOperationSeekStore = createSeekStore<OperationGroup, string, OperationFilter>(
  operationUrls.root,
  (group) => group.date,
)

export const useOperationStore = createFetchStore<Operation, unknown, unknown, { id: string }>(
  operationUrls.id,
)
