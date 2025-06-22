export interface Reference {
  id: string
  name: string
}

export interface RangeValue<T> {
  from?: T
  to?: T
}