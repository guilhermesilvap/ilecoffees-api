import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@ilecoffees:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (
      error.response?.status === 401 &&
      !original._retried &&
      !original.url?.includes('/sessions')
    ) {
      const refreshToken = localStorage.getItem('@ilecoffees:refreshToken')

      if (!refreshToken) {
        dispatchLogout()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`
            original._retried = true
            resolve(api(original))
          })
          refreshQueue.push(() => reject(error))
        })
      }

      original._retried = true
      isRefreshing = true

      try {
        const { data } = await axios.post<{ token: string }>(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:3333'}/sessions/refresh`,
          { refreshToken },
        )

        localStorage.setItem('@ilecoffees:token', data.token)
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`

        refreshQueue.forEach((cb) => cb(data.token))
        refreshQueue = []

        original.headers.Authorization = `Bearer ${data.token}`
        return api(original)
      } catch {
        refreshQueue = []
        dispatchLogout()
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

function dispatchLogout() {
  if (!window.location.pathname.includes('/login')) {
    localStorage.removeItem('@ilecoffees:token')
    localStorage.removeItem('@ilecoffees:refreshToken')
    localStorage.removeItem('@ilecoffees:user')
    localStorage.removeItem('@ilecoffees:type')
    localStorage.removeItem('@ilecoffees:supplierType')
    window.dispatchEvent(new CustomEvent('auth:logout'))
  }
}
