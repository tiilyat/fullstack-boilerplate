import { HttpResponse, http } from 'msw'
import { createUsers } from '@/testing/factories/user-factory'

export const listUsersURL = `${import.meta.env.VITE_API_URL}/api/auth/admin/list-users`
export const banUserURL = `${import.meta.env.VITE_API_URL}/api/auth/admin/ban-user`
export const unbanUserURL = `${import.meta.env.VITE_API_URL}/api/auth/admin/unban-user`
export const updateUserURL = `${import.meta.env.VITE_API_URL}/api/auth/admin/update-user`

export const adminHandlers = [
  http.get(listUsersURL, ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit')) || 50
    const offset = Number(url.searchParams.get('offset')) || 0
    const searchValue = url.searchParams.get('searchValue')
    const searchField = url.searchParams.get('searchField')

    // Создаем базовый набор пользователей
    const allUsers = createUsers(10)

    // Фильтрация по поиску
    let filteredUsers = allUsers
    if (searchValue && searchField === 'email') {
      filteredUsers = allUsers.filter((user) => user.email.toLowerCase().includes(searchValue.toLowerCase()))
    }

    // Пагинация
    const paginatedUsers = filteredUsers.slice(offset, offset + limit)

    return HttpResponse.json({
      users: paginatedUsers,
      total: filteredUsers.length,
    })
  }),

  http.post(banUserURL, async () => {
    // better-auth возвращает пустой объект при успехе
    return HttpResponse.json({})
  }),

  http.post(unbanUserURL, async () => {
    return HttpResponse.json({})
  }),

  http.post(updateUserURL, async () => {
    // better-auth возвращает пустой объект при успехе
    return HttpResponse.json({})
  }),
]
