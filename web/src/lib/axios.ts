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
})

api.interceptors.response.use((response) => {
  response.data = nullToUndefined(response.data)
  return response
})

export default api
