export interface AuthenticationResponse {
  accessToken: string
  refreshToken: string
}

export interface AuthenticationRefreshResponse {
  accessToken: string
  refreshToken?: string
}
