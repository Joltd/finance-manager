export interface Entity {
  name: string
  label: string
  fields: EntityField[]
}

export interface EntityField {
  name: string
}

export interface EntityPage {
  total: number
  page: number
  size: number
  values: any[]
}
