export interface DateRange {
  from?: string
  to?: string
}

export interface BackendRequestOptions {
  headers?: HeadersInit
  body?: BodyInit
}

export interface BackendResponse<T> {
  success: boolean
  body: T
  error: string
}

export interface Embedding {
  id: string
  input?: string
}
