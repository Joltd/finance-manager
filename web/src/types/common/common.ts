export interface BackendRequestOptions {
  headers?: HeadersInit
  body?: BodyInit
}

export interface BackendResponse<T> {
  success: boolean
  body: T
  error: string
}
