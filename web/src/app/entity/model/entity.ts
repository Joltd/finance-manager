export interface Entity {
  name: string
  label: string
  fields: EntityField[]
}

export type EntityFieldType =
  'ID' |
  'STRING' |
  'NUMBER' |
  'BOOLEAN' |
  'DATE' |
  'AMOUNT' |
  'ENUM' |
  'REFERENCE' |
  'JSON'

export interface EntityField {
  name: string
  type: EntityFieldType
  nullable: boolean
  referenceName: string | null
  enumConstants: string[]
}

export interface EntityPage {
  total: number
  page: number
  size: number
  values: any[]
}

export interface EntitySortEntry {
  field: string
  direction: 'ASC' | 'DESC'
}

export type EntityFilterOperator =
  'EQUALS' |
  'NOT_EQUALS' |
  'GREATER' |
  'GREATER_EQUALS' |
  'LESS' |
  'LESS_EQUALS' |
  'LIKE' |
  'NOT_LIKE' |
  'IN_LIST' |
  'NOT_IN_LIST' |
  'IS_NULL' |
  'IS_NOT_NULL' |
  'CURRENCY_IN_LIST' |
  'CURRENCY_NOT_IN_LIST' |
  'AMOUNT_EQUALS' |
  'AMOUNT_NOT_EQUALS' |
  'AMOUNT_GREATER' |
  'AMOUNT_GREATER_EQUALS' |
  'AMOUNT_LESS' |
  'AMOUNT_LESS_EQUALS'

export interface EntityFilterExpression {
  id: number,
  field: string,
  operator: EntityFilterOperator,
  value: any
}

export interface EntityFilterDialogData {
  fields: EntityField[]
  conditions: EntityFilterExpression[]
  newCondition: EntityFilterNode
}

export interface EntityFilterExpressionDialogData {
  fields: EntityField[]
  expression: EntityFilterExpression
}

export interface EntityFilterNode {
  negate: boolean
  expression: EntityFilterExpression | null
  condition: EntityFilterCondition | null
  children: EntityFilterNode[]
}

export type EntityFilterCondition =
  'AND' |
  'OR'
