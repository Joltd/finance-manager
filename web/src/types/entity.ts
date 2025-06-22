export enum FilterOperator {
  EQUALS = 'EQUALS',
  GREATER = 'GREATER',
  GREATER_EQUALS = 'GREATER_EQUALS',
  LESS = 'LESS',
  LESS_EQUALS = 'LESS_EQUALS',
  BETWEEN = 'BETWEEN',
  LIKE = 'LIKE',
  IN_LIST = 'IN_LIST',
}

export interface FilterOperatorVariant {
  negate: boolean
  operator: FilterOperator
  label: string
}

export interface FilterExpression {
  negate: boolean
  field: string
  operator: FilterOperator
  value: string
}

export interface EntityPage<T> {
  page: number
  size: number
  records: T[]
  total: number
}