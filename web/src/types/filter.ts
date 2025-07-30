export interface FilterPrimitiveProps {
  name: string
  label?: string
  alwaysVisible?: boolean
  defaultValue?: any
  value?: any
  onChange?: (value: any) => void
}
