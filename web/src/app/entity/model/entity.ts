export interface Entity {
  name: string
  label: string
  fields: EntityField[]
}

type EntityFieldType = 'ID' | 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'AMOUNT' | 'REFERENCE' | 'JSON'

export interface EntityField {
  name: string
  type: EntityFieldType
  nullable: boolean
}

export interface EntityPage {
  total: number
  page: number
  size: number
  values: any[]
}

export interface EntityFilterEntry {
  id: string
  field: string
  operator: string
  value: any
}

export interface EntityFilterCondition {
  id: number,
  negate: boolean,
  field: string,
  operator: string,
  empty: boolean,
  value: any
}

export interface EntityFilterOperator {
  name: string
  label: string
}
