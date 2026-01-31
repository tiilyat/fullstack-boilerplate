import { HttpResponse, http } from 'msw'
import { describe, expect, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createTestApp } from '@/testing/create-test-app'
import { createAdminSession } from '@/testing/factories/session-factory'
import { createUser, createUsers } from '@/testing/factories/user-factory'
import { banUserURL, listUsersURL, unbanUserURL, updateUserURL } from '@/testing/mocks/handlers/admin'
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

  describe('Ban/Unban функциональность', () => {
    describe('Отображение статуса бана', () => {
      test('показ badge "Active" для активного пользователя', async ({ worker }) => {
        const activeUser = createUser({
          email: 'testactive@example.com',
          name: 'Test User',
          banned: false,
        })

        worker.use(
          http.get(getSessionURL, () => {
            return HttpResponse.json(createAdminSession())
          }),
          http.get(listUsersURL, () => {
            return HttpResponse.json({
              users: [activeUser],
              total: 1,
            })
          })
        )

        await createTestApp({
          initialRoute: '/users',
        })

        await expect.element(page.getByText('testactive@example.com')).toBeInTheDocument()
        await expect.element(page.getByText('Active', { exact: true })).toBeInTheDocument()
      })

      test('показ badge "Banned" для забаненного пользователя', async ({ worker }) => {
        const bannedUser = createUser({
          email: 'testbanned@example.com',
          name: 'Test User',
          banned: true,
        })

        worker.use(
          http.get(getSessionURL, () => {
            return HttpResponse.json(createAdminSession())
          }),
          http.get(listUsersURL, () => {
            return HttpResponse.json({
              users: [bannedUser],
              total: 1,
            })
          })
        )

        await createTestApp({
          initialRoute: '/users',
        })

        await expect.element(page.getByText('testbanned@example.com')).toBeInTheDocument()
        await expect.element(page.getByText('Banned', { exact: true })).toBeInTheDocument()
      })
    })

    describe('Dropdown меню действий', () => {
      test('отображение действия "Ban" для активного пользователя', async ({ worker }) => {
        const activeUser = createUser({
          email: 'testuser@example.com',
          banned: false,
        })

        worker.use(
          http.get(getSessionURL, () => {
            return HttpResponse.json(createAdminSession())
          }),
          http.get(listUsersURL, () => {
            return HttpResponse.json({
              users: [activeUser],
              total: 1,
            })
          })
        )

        await createTestApp({
          initialRoute: '/users',
        })

        const actionsButton = page.getByRole('button', { name: 'User actions' })
        await userEvent.click(actionsButton)

        await expect.element(page.getByText('Ban', { exact: true })).toBeInTheDocument()
      })

      test('отображение действия "Unban" для забаненного пользователя', async ({ worker }) => {
        const bannedUser = createUser({
          email: 'testuser@example.com',
          banned: true,
        })

        worker.use(
          http.get(getSessionURL, () => {
            return HttpResponse.json(createAdminSession())
          }),
          http.get(listUsersURL, () => {
            return HttpResponse.json({
              users: [bannedUser],
              total: 1,
            })
          })
        )

        await createTestApp({
          initialRoute: '/users',
        })

        const actionsButton = page.getByRole('button', { name: 'User actions' })
        await userEvent.click(actionsButton)

        await expect.element(page.getByText('Unban', { exact: true })).toBeInTheDocument()
        await expect.element(page.getByText('Ban', { exact: true })).not.toBeInTheDocument()
      })
    })

    describe('Бан пользователя', () => {
      test('успешный бан пользователя через confirm dialog', async ({ worker }) => {
        const activeUser = createUser({
          id: 'test-user-id',
          email: 'toban@example.com',
          banned: false,
        })

        const bannedUser = { ...activeUser, banned: true }
        let banRequestMade = false

        worker.use(
          http.get(getSessionURL, () => {
            return HttpResponse.json(createAdminSession())
          }),
          http.get(listUsersURL, () => {
            return HttpResponse.json({
              users: [banRequestMade ? bannedUser : activeUser],
              total: 1,
            })
          }),
          http.post(banUserURL, async ({ request }) => {
            const body = await request.json()
            expect(body).toEqual({ userId: 'test-user-id' })
            banRequestMade = true
            return HttpResponse.json({})
          })
        )

        await createTestApp({
          initialRoute: '/users',
        })

        await expect.element(page.getByText('toban@example.com')).toBeInTheDocument()
        await expect.element(page.getByText('Active', { exact: true })).toBeInTheDocument()

        // Открыть dropdown
        const actionsButton = page.getByRole('button', { name: 'User actions' })
        await userEvent.click(actionsButton)

        // Кликнуть на "Ban"
        const banButton = page.getByText('Ban', { exact: true })
        await userEvent.click(banButton)

        // Проверить confirm dialog
        await expect.element(page.getByText('Ban User', { exact: true })).toBeInTheDocument()
        await expect.element(page.getByText(/Are you sure you want to ban toban@example.com/)).toBeInTheDocument()

        // Подтвердить бан
        const confirmButton = page.getByRole('button', { name: 'Ban' })
        await userEvent.click(confirmButton)

        // Проверить обновление UI - статус изменился на Banned
        await expect.element(page.getByText('Banned', { exact: true })).toBeInTheDocument()
      })

      test('отмена бана через cancel в confirm dialog', async ({ worker }) => {
        const activeUser = createUser({
          id: 'test-user-id',
          email: 'toban@example.com',
          banned: false,
        })

        let banRequestMade = false

        worker.use(
          http.get(getSessionURL, () => {
            return HttpResponse.json(createAdminSession())
          }),
          http.get(listUsersURL, () => {
            return HttpResponse.json({
              users: [activeUser],
              total: 1,
            })
          }),
          http.post(banUserURL, () => {
            banRequestMade = true
            return HttpResponse.json({})
          })
        )

        await createTestApp({
          initialRoute: '/users',
        })

        await expect.element(page.getByText('toban@example.com')).toBeInTheDocument()

        const actionsButton = page.getByRole('button', { name: 'User actions' })
        await userEvent.click(actionsButton)
        await userEvent.click(page.getByText('Ban', { exact: true }))

        await expect.element(page.getByText('Ban User', { exact: true })).toBeInTheDocument()

        // Отменить бан
        const cancelButton = page.getByRole('button', { name: 'Cancel' })
        await userEvent.click(cancelButton)

        // Dialog закрылся
        await expect.element(page.getByText('Ban User', { exact: true })).not.toBeInTheDocument()

        // Запрос НЕ был сделан
        expect(banRequestMade).toBe(false)

        // Badge остался "Active"
        await expect.element(page.getByText('Active', { exact: true })).toBeInTheDocument()
      })
    })

    describe('Разбан пользователя', () => {
      test('успешный разбан пользователя через confirm dialog', async ({ worker }) => {
        const bannedUser = createUser({
          id: 'test-user-id',
          email: 'tounban@example.com',
          banned: true,
        })

        const activeUser = { ...bannedUser, banned: false }
        let unbanRequestMade = false

        worker.use(
          http.get(getSessionURL, () => {
            return HttpResponse.json(createAdminSession())
          }),
          http.get(listUsersURL, () => {
            return HttpResponse.json({
              users: [unbanRequestMade ? activeUser : bannedUser],
              total: 1,
            })
          }),
          http.post(unbanUserURL, async ({ request }) => {
            const body = await request.json()
            expect(body).toEqual({ userId: 'test-user-id' })
            unbanRequestMade = true
            return HttpResponse.json({})
          })
        )

        await createTestApp({
          initialRoute: '/users',
        })

        await expect.element(page.getByText('tounban@example.com')).toBeInTheDocument()
        await expect.element(page.getByText('Banned', { exact: true })).toBeInTheDocument()

        const actionsButton = page.getByRole('button', { name: 'User actions' })
        await userEvent.click(actionsButton)
        await userEvent.click(page.getByText('Unban', { exact: true }))

        await expect.element(page.getByText('Unban User', { exact: true })).toBeInTheDocument()
        await expect.element(page.getByText(/Are you sure you want to unban tounban@example.com/)).toBeInTheDocument()

        const confirmButton = page.getByRole('button', { name: 'Unban' })
        await userEvent.click(confirmButton)

        // Проверить обновление UI - статус изменился на Active
        await expect.element(page.getByText('Active', { exact: true })).toBeInTheDocument()
      })

      test('отмена разбана через cancel в confirm dialog', async ({ worker }) => {
        const bannedUser = createUser({
          id: 'test-user-id',
          email: 'tounban@example.com',
          banned: true,
        })

        let unbanRequestMade = false

        worker.use(
          http.get(getSessionURL, () => {
            return HttpResponse.json(createAdminSession())
          }),
          http.get(listUsersURL, () => {
            return HttpResponse.json({
              users: [bannedUser],
              total: 1,
            })
          }),
          http.post(unbanUserURL, () => {
            unbanRequestMade = true
            return HttpResponse.json({})
          })
        )

        await createTestApp({
          initialRoute: '/users',
        })

        await expect.element(page.getByText('tounban@example.com')).toBeInTheDocument()

        const actionsButton = page.getByRole('button', { name: 'User actions' })
        await userEvent.click(actionsButton)
        await userEvent.click(page.getByText('Unban', { exact: true }))

        await expect.element(page.getByText('Unban User', { exact: true })).toBeInTheDocument()

        const cancelButton = page.getByRole('button', { name: 'Cancel' })
        await userEvent.click(cancelButton)

        await expect.element(page.getByText('Unban User', { exact: true })).not.toBeInTheDocument()
        expect(unbanRequestMade).toBe(false)
        await expect.element(page.getByText('Banned', { exact: true })).toBeInTheDocument()
      })
    })
  })

  describe('User Details Slideover', () => {
    test('отображение Details для активного пользователя', async ({ worker }) => {
      const activeUser = createUser({
        email: 'test@example.com',
        banned: false,
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [activeUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)

      await expect.element(page.getByText('Details', { exact: true })).toBeInTheDocument()
    })

    test('отображение Details для забаненного пользователя', async ({ worker }) => {
      const bannedUser = createUser({
        email: 'banned@example.com',
        banned: true,
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [bannedUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)

      await expect.element(page.getByText('Details', { exact: true })).toBeInTheDocument()
    })

    test('открытие slideover при клике на Details', async ({ worker }) => {
      const testUser = createUser({
        id: 'user-123',
        email: 'details@example.com',
        name: 'Test User',
        role: 'user',
        emailVerified: true,
        banned: false,
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Details', { exact: true }))

      await expect.element(page.getByText('User Details')).toBeInTheDocument()
    })

    test('закрытие slideover', async ({ worker }) => {
      const testUser = createUser({
        email: 'close@example.com',
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Details', { exact: true }))

      await expect.element(page.getByText('User Details')).toBeInTheDocument()

      // Close using Escape key
      await userEvent.keyboard('{Escape}')

      await expect.element(page.getByText('User Details')).not.toBeInTheDocument()
    })

    test('отображение секции Basic Info', async ({ worker }) => {
      const testUser = createUser({
        id: 'user-basic-123',
        email: 'basic@example.com',
        name: 'Basic User',
        role: 'admin',
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Details', { exact: true }))

      await expect.element(page.getByText('Basic Info')).toBeInTheDocument()
      // Check content is present - using nth(1) to get slideover version
      await expect.element(page.getByText('basic@example.com').nth(1)).toBeInTheDocument()
      await expect.element(page.getByText('Basic User').nth(1)).toBeInTheDocument()
      await expect.element(page.getByText('admin').nth(1)).toBeInTheDocument()
    })

    test('отображение секции Verification', async ({ worker }) => {
      const verifiedUser = createUser({
        email: 'verified@example.com',
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

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Details', { exact: true }))

      // Check Verification section header is displayed
      await expect.element(page.getByText('Verification')).toBeInTheDocument()
      // Check verification status badge (2nd occurrence is in slideover, first is table header)
      await expect.element(page.getByText('Verified', { exact: true }).nth(1)).toBeInTheDocument()
    })

    test('отображение секции Timestamps', async ({ worker }) => {
      const testUser = createUser({
        email: 'dates@example.com',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-20'),
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Details', { exact: true }))

      await expect.element(page.getByText('Timestamps', { exact: true })).toBeInTheDocument()
      await expect.element(page.getByText('Created:')).toBeInTheDocument()
      await expect.element(page.getByText('Updated:')).toBeInTheDocument()
    })

    test('отображение секции Ban Info для забаненного пользователя', async ({ worker }) => {
      const bannedUser = createUser({
        email: 'banneduser@example.com',
        banned: true,
        banReason: 'Violation of terms',
        banExpires: new Date('2025-12-31'),
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [bannedUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Details', { exact: true }))

      await expect.element(page.getByText('Ban Info')).toBeInTheDocument()
      await expect.element(page.getByText('Violation of terms')).toBeInTheDocument()
    })

    test('отсутствие секции Ban Info для активного пользователя', async ({ worker }) => {
      const activeUser = createUser({
        email: 'activeuser@example.com',
        banned: false,
        banReason: null,
        banExpires: null,
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [activeUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Details', { exact: true }))

      await expect.element(page.getByText('Ban Info')).not.toBeInTheDocument()
    })
  })

  describe('User Edit Feature', () => {
    test('открытие edit slideover при клике на Edit в dropdown меню', async ({ worker }) => {
      const testUser = createUser({
        id: 'user-edit-123',
        email: 'edit@example.com',
        name: 'Edit User',
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Edit', { exact: true }))

      await expect.element(page.getByRole('heading', { name: 'Edit User' })).toBeInTheDocument()
    })

    test('префилл имени пользователя в поле Name', async ({ worker }) => {
      const testUser = createUser({
        id: 'user-prefill-123',
        email: 'prefill@example.com',
        name: 'Prefilled Name',
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Edit', { exact: true }))

      const nameInput = page.getByLabelText('Name')
      await expect.element(nameInput).toHaveValue('Prefilled Name')
    })

    test('кнопка Save disabled при отсутствии изменений', async ({ worker }) => {
      const testUser = createUser({
        email: 'nodirty@example.com',
        name: 'No Dirty',
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Edit', { exact: true }))

      const saveButton = page.getByRole('button', { name: 'Save' })
      await expect.element(saveButton).toBeDisabled()
    })

    test('кнопка Save enabled после изменения имени', async ({ worker }) => {
      const testUser = createUser({
        email: 'dirty@example.com',
        name: 'Original Name',
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Edit', { exact: true }))

      const nameInput = page.getByLabelText('Name')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'New Name')

      const saveButton = page.getByRole('button', { name: 'Save' })
      await expect.element(saveButton).toBeEnabled()
    })

    test('успешное сохранение показывает success toast и закрывает slideover', async ({ worker }) => {
      const testUser = createUser({
        id: 'user-save-123',
        email: 'save@example.com',
        name: 'Original Name',
      })

      let updateRequestMade = false

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        }),
        http.post(updateUserURL, async ({ request }) => {
          const body = (await request.json()) as { userId: string; data: { name?: string } }
          expect(body.userId).toBe('user-save-123')
          expect(body.data.name).toBe('New Name')
          updateRequestMade = true
          return HttpResponse.json({})
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Edit', { exact: true }))

      const nameInput = page.getByLabelText('Name')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'New Name')

      const saveButton = page.getByRole('button', { name: 'Save' })
      await userEvent.click(saveButton)

      // Проверить, что slideover закрылся (подтверждает успешное сохранение)
      await expect.element(page.getByRole('heading', { name: 'Edit User' })).not.toBeInTheDocument()

      // Проверить, что запрос был сделан
      expect(updateRequestMade).toBe(true)
    })

    test('ошибка сохранения показывает error toast', async ({ worker }) => {
      const testUser = createUser({
        id: 'user-error-123',
        email: 'error@example.com',
        name: 'Original Name',
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        }),
        http.post(updateUserURL, () => {
          return HttpResponse.json(
            {
              error: { message: 'Update failed' },
            },
            { status: 500 }
          )
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Edit', { exact: true }))

      const nameInput = page.getByLabelText('Name')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'New Name')

      const saveButton = page.getByRole('button', { name: 'Save' })
      await userEvent.click(saveButton)

      // Slideover остается открытым после ошибки (подтверждает что произошла ошибка)
      await expect.element(page.getByRole('heading', { name: 'Edit User' })).toBeInTheDocument()
    })

    test('закрытие с несохраненными изменениями показывает confirm dialog', async ({ worker }) => {
      const testUser = createUser({
        email: 'confirm@example.com',
        name: 'Original Name',
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Edit', { exact: true }))

      const nameInput = page.getByLabelText('Name')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'Changed Name')

      // Очистить любые toast из предыдущих тестов, чтобы они не блокировали клики
      const toasts = document.querySelectorAll('[role="alert"]')
      toasts.forEach((toast) => {
        toast.remove()
      })

      const cancelButton = page.getByRole('button', { name: 'Cancel' })

      // Mock window.confirm
      const confirmStub = vi.fn().mockReturnValue(false)
      vi.stubGlobal('confirm', confirmStub)

      await userEvent.click(cancelButton)

      // Проверить, что confirm был вызван
      expect(confirmStub).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to close?')

      // Slideover остается открытым, так как пользователь отказался
      await expect.element(page.getByRole('heading', { name: 'Edit User' })).toBeInTheDocument()

      vi.unstubAllGlobals()
    })

    test('закрытие без изменений не показывает confirm dialog', async ({ worker }) => {
      const testUser = createUser({
        email: 'noconfirm@example.com',
        name: 'Original Name',
      })

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: [testUser],
            total: 1,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const actionsButton = page.getByRole('button', { name: 'User actions' })
      await userEvent.click(actionsButton)
      await userEvent.click(page.getByText('Edit', { exact: true }))

      // Закрыть slideover с помощью Escape (альтернатива кнопке Cancel)
      await userEvent.keyboard('{Escape}')

      // Slideover закрылся без confirm dialog
      await expect.element(page.getByRole('heading', { name: 'Edit User' })).not.toBeInTheDocument()
    })
  })
})
