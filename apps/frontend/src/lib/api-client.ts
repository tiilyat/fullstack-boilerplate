import hc from '@fullstack-boilerplate/api/client'

const apiClient = hc(import.meta.env.VITE_API_URL, {
  init: {
    credentials: 'include',
  },
})

export default apiClient
