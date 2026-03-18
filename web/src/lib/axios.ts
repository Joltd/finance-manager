import axios from 'axios'

function nullToUndefined<T>(value: T): T {
  if (value === null) {
    return undefined as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map(nullToUndefined) as unknown as T
  }
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, nullToUndefined(v)])) as T
  }
  return value
}

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
})

api.interceptors.response.use(
  (response) => {
    response.data = nullToUndefined(response.data)
    return response
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?redirectUrl=${redirectUrl}`
    }
    return Promise.reject(error)
  },
)

export default api
