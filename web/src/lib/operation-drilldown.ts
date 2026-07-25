import {
  asSearchParams,
  writeDateRangeParam,
  writeIdsParam,
  writeParam,
} from '@/lib/filter-url'

export function buildOperationDrilldownUrl(filter: Record<string, unknown>): string {
  const searchParams = asSearchParams(filter, (values, params) => {
    writeDateRangeParam(values, params, 'period')
    writeParam(values, params, 'type')
    writeIdsParam(values, params, 'include')
    writeIdsParam(values, params, 'exclude')
    writeIdsParam(values, params, 'includeTags')
    writeIdsParam(values, params, 'excludeTags')
  })

  return `/operation${searchParams}`
}
