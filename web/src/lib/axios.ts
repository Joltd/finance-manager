import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => {
    response.data = nullToUndefined(response.data)
    return response
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

function nullToUndefined(data: any): any {
  if (Array.isArray(data)) {
    return data.map(nullToUndefined)
  }
  if (data && typeof data === 'object') {
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, nullToUndefined(v)]))
  }
  return data === null ? undefined : data
}

export default api
