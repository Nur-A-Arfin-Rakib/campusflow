import axios from 'axios'

// Development:  baseURL = '/api'  (Vite proxies to localhost:5000)
// Production (Render static+server same domain):  baseURL = '/api'
// Production (Railway — server is a separate URL):  baseURL = 'https://your-server.up.railway.app/api'
const baseURL = (typeof __API_URL__ !== 'undefined' && __API_URL__)
  ? `${__API_URL__}/api`
  : '/api'

const api = axios.create({
  baseURL,
  withCredentials: true, // send HttpOnly cookies
})

let isRefreshing = false
let queue = []

const processQueue = (error) => {
  queue.forEach(p => error ? p.reject(error) : p.resolve())
  queue = []
}

api.interceptors.response.use(
  r => r,
  async err => {
    const original = err.config
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(() => api(original)).catch(e => Promise.reject(e))
      }
      original._retry = true
      isRefreshing = true
      try {
        await api.post('/auth/refresh')
        processQueue(null)
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr)
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
