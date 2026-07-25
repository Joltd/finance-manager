import {
  asSearchParams,
  writeDateRangeParam,
  writeIdsParam,
  writeParam,
} from '@/lib/filter-url'
import { OperationType } from '@/types/operation'

export interface OperationDrilldownFilter {
  period?: {
    from: Date,
    to: Date,
  },
  type?: OperationType,
  include?: string[],
  includeTags?: string[],
}

export function buildOperationDrilldownUrl(filter: OperationDrilldownFilter): string {
  const searchParams = asSearchParams(filter as Record<string, unknown>, (values, params) => {
    writeDateRangeParam(values, params, 'period')
    writeParam(values, params, 'type')
    writeIdsParam(values, params, 'include')
    writeIdsParam(values, params, 'includeTags')
  })

  return `/operation${searchParams}`
}
