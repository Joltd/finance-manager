import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use((response) => {
  response.data = nullToUndefined(response.data)
  return response
})

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
