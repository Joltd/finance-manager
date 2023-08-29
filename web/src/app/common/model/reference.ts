export interface Reference {
  id: string
  name: string
  deleted: boolean
}

export interface Endpoint {
  url: string
  queryParams: {
    [param: string]: string | ReadonlyArray<string>
  }
}
