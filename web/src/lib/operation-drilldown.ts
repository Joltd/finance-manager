import { setDateParam, setParam } from '@/lib/filter-url'
import { OperationType } from '@/types/operation'

export interface OperationDrilldownFilter {
  dateFrom?: Date
  dateTo?: Date
  type?: OperationType
  accountId?: string
  tagId?: string
}

/**
 * Builds a link into the Operation page pre-filtered to a single report data point —
 * deliberately ignores whatever broader include/exclude filters the report itself had applied.
 */
export function buildOperationDrilldownUrl(filter: OperationDrilldownFilter): string {
  const params = new URLSearchParams()
  setDateParam(params, 'dateFrom', filter.dateFrom)
  setDateParam(params, 'dateTo', filter.dateTo)
  setParam(params, 'type', filter.type)
  setParam(params, 'include', filter.accountId)
  setParam(params, 'includeTags', filter.tagId)

  const qs = params.toString()
  return qs ? `/operation?${qs}` : '/operation'
}
