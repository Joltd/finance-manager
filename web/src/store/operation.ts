import { createSeekStore } from '@/store/common/seek'
import { operationUrls } from '@/api/operation'
import { OperationFilter, OperationGroup } from '@/types/operation'

export const useOperationSeekStore = createSeekStore<OperationGroup, string, OperationFilter>(
  operationUrls.root,
  (group) => group.date,
  new Date().toISOString().split('T')[0],
)
