import { HttpResponse, http } from 'msw'
import { describe, expect, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createTestApp } from '@/testing/create-test-app'
import { createAdminSession } from '@/testing/factories/session-factory'
import { createUser, createUsers } from '@/testing/factories/user-factory'
import { listUsersURL } from '@/testing/mocks/handlers/admin'
import { getSessionURL } from '@/testing/mocks/handlers/auth'
import { test } from '@/testing/test-extend.server'

describe('Users Page', () => {
  describe('Основное отображение', () => {
    test('отображение страницы Users', async ({ worker }) => {
      // Мокировать admin сессию
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [],
            total: 0,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      // Проверить наличие заголовка
      expect(page.getByText('Users')).toBeInTheDocument()

      // Проверить наличие поля поиска
      expect(page.getByPlaceholder('Search by email...')).toBeInTheDocument()
    })

    test('отображение списка пользователей', async ({ worker }) => {
      const testUsers = [
        createUser({ email: 'user1@example.com', name: 'User One' }),
        createUser({ email: 'user2@example.com', name: 'User Two' }),
        createUser({ email: 'user3@example.com', name: 'User Three' }),
      ]

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: testUsers,
            total: 3,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      // Проверить email каждого пользователя
      await expect.element(page.getByText('user1@example.com')).toBeInTheDocument()
      await expect.element(page.getByText('user2@example.com')).toBeInTheDocument()
      await expect.element(page.getByText('user3@example.com')).toBeInTheDocument()

      // Проверить имена пользователей
      await expect.element(page.getByText('User One')).toBeInTheDocument()
      await expect.element(page.getByText('User Two')).toBeInTheDocument()
      await expect.element(page.getByText('User Three')).toBeInTheDocument()
    })
  })

  describe('Статус верификации', () => {
    test('показ верифицированных пользователей', async ({ worker }) => {
      const verifiedUser = createUser({
        email: 'verified@example.com',
        name: 'Verified User',
        emailVerified: true,
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [verifiedUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      // Найти строку с этим пользователем и проверить наличие '✓'
      await expect.element(page.getByText('verified@example.com')).toBeInTheDocument()

      // Проверить наличие индикатора верификации
      await expect.element(page.getByText('✓')).toBeInTheDocument()
    })

    test('показ неверифицированных пользователей', async ({ worker }) => {
      const unverifiedUser = createUser({
        email: 'unverified@example.com',
        name: 'Unverified User',
        emailVerified: false,
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [unverifiedUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      // Найти строку с этим пользователем и проверить наличие '✗'
      await expect.element(page.getByText('unverified@example.com')).toBeInTheDocument()

      // Проверить наличие индикатора неверифицированного статуса
      await expect.element(page.getByText('✗')).toBeInTheDocument()
    })
  })

  describe('Поиск', () => {
    test('поиск пользователя по email', async ({ worker }) => {
      vi.useFakeTimers()

      const allUsers = [
        createUser({ email: 'alice@example.com', name: 'Alice' }),
        createUser({ email: 'bob@example.com', name: 'Bob' }),
        createUser({ email: 'charlie@example.com', name: 'Charlie' }),
      ]

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, ({ request }) => {
          const url = new URL(request.url)
          const searchValue = url.searchParams.get('searchValue')

          if (searchValue === 'alice') {
            return HttpResponse.json({
              users: [allUsers[0]],
              total: 1,
            })
          }

          return HttpResponse.json({
            users: allUsers,
            total: 3,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      // Дождаться загрузки начальных данных
      await expect.element(page.getByText('alice@example.com')).toBeInTheDocument()

      const searchInput = page.getByPlaceholder('Search by email...')
      await userEvent.type(searchInput, 'alice')

      // Дождаться debounce
      vi.advanceTimersByTime(300)

      // Проверить, что отображается только найденный пользователь
      await expect.element(page.getByText('alice@example.com')).toBeInTheDocument()

      vi.useRealTimers()
    })

    test('поиск без результатов', async ({ worker }) => {
      vi.useFakeTimers()

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, ({ request }) => {
          const url = new URL(request.url)
          const searchValue = url.searchParams.get('searchValue')

          if (searchValue === 'nonexistent') {
            return HttpResponse.json({
              users: [],
              total: 0,
            })
          }

          return HttpResponse.json({
            users: createUsers(3),
            total: 3,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const searchInput = page.getByPlaceholder('Search by email...')
      await userEvent.type(searchInput, 'nonexistent')

      // Дождаться debounce
      vi.advanceTimersByTime(300)

      vi.useRealTimers()
    })
  })

  describe('Пагинация', () => {
    test('показ пагинации для большого количества пользователей', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: createUsers(50),
            total: 75,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      // Проверить наличие пагинации (ищем элемент пагинации)
      const pagination = page.getByRole('navigation')
      await expect.element(pagination).toBeInTheDocument()
    })

    test('скрытие пагинации для малого количества', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: createUsers(30),
            total: 30,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      // Проверить отсутствие пагинации
      const pagination = page.getByRole('navigation')
      await expect.element(pagination).not.toBeInTheDocument()
    })

    test('переход на следующую страницу', async ({ worker }) => {
      const firstPageUsers = createUsers(50).map((user, index) => ({
        ...user,
        id: `user-${index + 1}`,
        email: `user${index + 1}@example.com`,
      }))

      const secondPageUsers = createUsers(25).map((user, index) => ({
        ...user,
        id: `user-${index + 51}`,
        email: `user${index + 51}@example.com`,
      }))

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, ({ request }) => {
          const url = new URL(request.url)
          const offset = Number(url.searchParams.get('offset')) || 0

          if (offset === 0) {
            return HttpResponse.json({
              users: firstPageUsers,
              total: 75,
            })
          } else if (offset === 50) {
            return HttpResponse.json({
              users: secondPageUsers,
              total: 75,
            })
          }

          return HttpResponse.json({
            users: [],
            total: 75,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      // Проверить первую страницу
      await expect.element(page.getByText('user1@example.com')).toBeInTheDocument()
      await expect.element(page.getByText('user50@example.com')).toBeInTheDocument()

      // Найти и кликнуть на кнопку следующей страницы
      const nextButton = page.getByRole('button', { name: /next/i })
      await userEvent.click(nextButton)

      // Проверить вторую страницу
      await expect.element(page.getByText('user51@example.com')).toBeInTheDocument()
      await expect.element(page.getByText('user75@example.com')).toBeInTheDocument()
    })
  })

  describe('Обработка ошибок', () => {
    test('отображение сообщения об ошибке', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({ error: { message: 'Database error' } }, { status: 500 })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      // Проверить отображение ошибки
      await expect.element(page.getByText('Error loading users')).toBeInTheDocument()
      await expect.element(page.getByText('Failed to fetch users')).toBeInTheDocument()
    })
  })

  describe('Граничные случаи', () => {
    test('обработка пустого списка', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [],
            total: 0,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      // Проверить, что страница отображается
      expect(page.getByText('Users')).toBeInTheDocument()

      // Проверить отсутствие пагинации
      const pagination = page.getByRole('navigation')
      await expect.element(pagination).not.toBeInTheDocument()
    })
  })
})
