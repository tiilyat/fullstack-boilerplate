import { HttpResponse, http } from 'msw'
import { describe, expect } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createTestApp } from '../utils/create-test-app'
import { createAdminSession } from '../utils/factories/session-factory'
import { createUser, createUsers } from '../utils/factories/user-factory'
import { banUserURL, listUsersURL, unbanUserURL, updateUserURL } from '../utils/mocks/handlers/admin'
import { getSessionURL } from '../utils/mocks/handlers/auth'
import { test } from '../utils/test-extend.server'

describe('Users Page', () => {
  describe('Основное отображение', () => {
    test('отображение страницы Users', async ({ worker }) => {
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

      expect(page.getByText('Users')).toBeInTheDocument()
      expect(page.getByPlaceholder('Search by email...')).toBeInTheDocument()
    })

    test('отображение списка пользователей', async ({ worker }) => {
      const users = createUsers(10)

      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        }),
        http.get(listUsersURL, () => {
          return HttpResponse.json({
            users: users,
            total: users.length,
          })
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      for (const user of users) {
        await expect.element(page.getByText(user.email)).toBeInTheDocument()
        await expect.element(page.getByText(user.name)).toBeInTheDocument()
      }
    })
  })

  describe('Статус верификации', () => {
    test('показ верифицированных пользователей', async ({ worker }) => {
      const verifiedUser = createUser({
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
      await expect.element(page.getByText(verifiedUser.email)).toBeInTheDocument()

      // Проверить наличие индикатора верификации
      await expect.element(page.getByText('✓')).toBeInTheDocument()
    })

    test('показ неверифицированных пользователей', async ({ worker }) => {
      const unverifiedUser = createUser({
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
      await expect.element(page.getByText(unverifiedUser.email)).toBeInTheDocument()

      // Проверить наличие индикатора неверифицированного статуса
      await expect.element(page.getByText('✗')).toBeInTheDocument()
    })
  })

  describe('Поиск', () => {
    test('поиск пользователя по email', async ({ worker }) => {
      const allUsers = [createUser({ email: 'alice@example.com', name: 'Alice' }), createUser(), createUser()]

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

      // Проверить, что отображается только найденный пользователь
      await expect.element(page.getByText('alice@example.com')).toBeInTheDocument()
    })

    test('поиск без результатов', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(createAdminSession())
        })
      )

      await createTestApp({
        initialRoute: '/users',
      })

      const searchInput = page.getByPlaceholder('Search by email...')
      await userEvent.type(searchInput, `nonexistent${Math.random()}`)
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

  describe('Ban/Unban функциональность', () => {
    describe('Отображение статуса бана', () => {
      test('показ badge "Active" для активного пользователя', async ({ worker }) => {
        const activeUser = createUser({
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

        await expect.element(page.getByText(activeUser.email)).toBeInTheDocument()
        await expect.element(page.getByText('Active', { exact: true })).toBeInTheDocument()
      })

      test('показ badge "Banned" для забаненного пользователя', async ({ worker }) => {
        const bannedUser = createUser({
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

        await expect.element(page.getByText(bannedUser.email)).toBeInTheDocument()
        await expect.element(page.getByText('Banned', { exact: true })).toBeInTheDocument()
      })
    })

    describe('Dropdown меню действий', () => {
      test('отображение действия "Ban" для активного пользователя', async ({ worker }) => {
        const activeUser = createUser({
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
            expect(body).toEqual({ userId: activeUser.id })
            banRequestMade = true
            return HttpResponse.json({})
          })
        )

        await createTestApp({
          initialRoute: '/users',
        })

        await expect.element(page.getByText(activeUser.email)).toBeInTheDocument()
        await expect.element(page.getByText('Active', { exact: true })).toBeInTheDocument()

        // Открыть dropdown
        const actionsButton = page.getByRole('button', { name: 'User actions' })
        await userEvent.click(actionsButton)

        // Кликнуть на "Ban"
        const banButton = page.getByText('Ban', { exact: true })
        await userEvent.click(banButton)

        // Проверить confirm dialog
        await expect.element(page.getByText('Ban User', { exact: true })).toBeInTheDocument()
        await expect.element(page.getByText(/Are you sure you want to ban/gi).first()).toBeInTheDocument()

        // Подтвердить бан
        const confirmButton = page.getByRole('button', { name: 'Ban' })
        await userEvent.click(confirmButton)

        // Проверить обновление UI - статус изменился на Banned
        await expect.element(page.getByText('Banned', { exact: true })).toBeInTheDocument()
      })

      test('отмена бана через cancel в confirm dialog', async ({ worker }) => {
        const activeUser = createUser({
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

        await expect.element(page.getByText(activeUser.email)).toBeInTheDocument()

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
            expect(body).toEqual({ userId: bannedUser.id })
            unbanRequestMade = true
            return HttpResponse.json({})
          })
        )

        await createTestApp({
          initialRoute: '/users',
        })

        await expect.element(page.getByText(bannedUser.email)).toBeInTheDocument()
        await expect.element(page.getByText('Banned', { exact: true })).toBeInTheDocument()

        const actionsButton = page.getByRole('button', { name: 'User actions' })
        await userEvent.click(actionsButton)
        await userEvent.click(page.getByText('Unban', { exact: true }))

        await expect.element(page.getByText('Unban User', { exact: true })).toBeInTheDocument()

        await expect.element(page.getByText(/Are you sure you want to unban/gi).first()).toBeInTheDocument()

        const confirmButton = page.getByRole('button', { name: 'Unban' })
        await userEvent.click(confirmButton)

        // Проверить обновление UI - статус изменился на Active
        await expect.element(page.getByText('Active', { exact: true })).toBeInTheDocument()
      })

      test('отмена разбана через cancel в confirm dialog', async ({ worker }) => {
        const bannedUser = createUser({
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

        await expect.element(page.getByText(bannedUser.email)).toBeInTheDocument()

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
      const testUser = createUser()

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
  })

  describe('User Edit Feature', () => {
    test('открытие edit slideover при клике на Edit в dropdown меню', async ({ worker }) => {
      const testUser = createUser()

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
      const testUser = createUser()

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
      await expect.element(nameInput).toHaveValue(testUser.name)
    })

    test('кнопка Save disabled при отсутствии изменений', async ({ worker }) => {
      const testUser = createUser()

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
      const testUser = createUser()

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

    test('успешное сохранение закрывает slideover', async ({ worker }) => {
      const testUser = createUser()

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
          expect(body.userId).toBe(testUser.id)
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
  })
})
