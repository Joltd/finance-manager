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

export type EntityFilterOperator =
  'EQUALS' |
  'GREATER' |
  'GREATER_EQUALS' |
  'LESS' |
  'LESS_EQUALS' |
  'LIKE' |
  'IN_LIST' |
  'IS_NULL' |
  'CURRENCY_IN_LIST' |
  'AMOUNT_EQUALS' |
  'AMOUNT_NOT_EQUALS' |
  'AMOUNT_GREATER' |
  'AMOUNT_GREATER_EQUALS' |
  'AMOUNT_LESS' |
  'AMOUNT_LESS_EQUALS'


export type EntityFilterCondition =
  'AND' |
  'OR'

export const OPERATOR_LABELS: { [key in EntityFilterOperator]: string } = {
  'EQUALS': 'equals...',
  'GREATER': 'greater....',
  'GREATER_EQUALS': 'greater or equals...',
  'LESS': 'less than...',
  'LESS_EQUALS': 'less or equals...',
  'LIKE': 'like...',
  'IN_LIST': 'in list...',
  'IS_NULL': 'is null',
  'CURRENCY_IN_LIST': 'currency in list...',
  'AMOUNT_EQUALS': 'amount equals...',
  'AMOUNT_NOT_EQUALS': 'amount not equals...',
  'AMOUNT_GREATER': 'amount greater...',
  'AMOUNT_GREATER_EQUALS': 'amount greater equals...',
  'AMOUNT_LESS': 'amount less...',
  'AMOUNT_LESS_EQUALS': 'amount less or equals...',
}

export interface Entity {
  name: string
  label: string
  fields: EntityField[]
}

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

export interface EntityFilterNode {
  id: number
  negate: boolean
  expression: EntityFilterExpression | null
  condition: EntityFilterCondition | null
  children: EntityFilterNode[]
}

export interface EntitySortEntry {
  field: string
  direction: 'ASC' | 'DESC'
}

export interface EntityFilterExpression {
  id: number,
  field: string,
  operator: EntityFilterOperator,
  value: any
}

export interface EntityFilterDialogData {
  fields: EntityField[]
  filter: EntityFilterNode
}

export interface EntityFilterExpressionDialogData {
  fields: EntityField[]
  expression: EntityFilterExpression
}

export function and(expressions: EntityFilterNode[]): EntityFilterNode {
  return {
    id: 0,
    negate: false,
    expression: null,
    condition: 'AND',
    children: expressions
  }
}

export function or(expressions: EntityFilterNode[]): EntityFilterNode {
  return {
    id: 0,
    negate: false,
    expression: null,
    condition: 'OR',
    children: expressions
  }
}

export function expression(field: string, operator: EntityFilterOperator, value: any): EntityFilterNode {
  return {
    id: 0,
    negate: false,
    expression: {
      id: 0,
      field: field,
      operator: operator,
      value: value
    },
    condition: null,
    children: []
  }
}
