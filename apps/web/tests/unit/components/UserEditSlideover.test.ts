import { HttpResponse, http } from 'msw'
import { describe, expect } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import UserEditSlideover from '@/components/UserEditSlideover.vue'
import { createUser } from '../../utils/factories/user-factory'
import { updateUserURL } from '../../utils/mocks/handlers/admin'
import { renderComponent } from '../../utils/render-component'
import { test } from '../../utils/test-extend.server'

describe('UserEditSlideover', () => {
  describe('Форма и данные', () => {
    test('префилл имени пользователя в поле Name', async () => {
      const user = createUser({
        name: 'Test User',
      })

      renderComponent(UserEditSlideover, {
        props: { open: true, user },
      })

      const nameInput = page.getByLabelText('Name')
      await expect.element(nameInput).toHaveValue('Test User')
    })

    test('сброс формы при смене пользователя', async () => {
      const user1 = createUser({
        id: 'user-1',
        name: 'User One',
      })

      const user2 = createUser({
        id: 'user-2',
        name: 'User Two',
      })

      const { rerender } = renderComponent(UserEditSlideover, {
        props: { open: true, user: user1 },
      })

      const nameInput = page.getByLabelText('Name')
      await expect.element(nameInput).toHaveValue('User One')

      // Изменить пользователя
      rerender({ open: true, user: user2 })

      // Форма должна сброситься с новыми данными
      await expect.element(nameInput).toHaveValue('User Two')
    })
  })

  describe('Состояние кнопки Save', () => {
    test('кнопка Save disabled при отсутствии изменений', async () => {
      const user = createUser({
        name: 'Test User',
      })

      renderComponent(UserEditSlideover, {
        props: { open: true, user },
      })

      const saveButton = page.getByRole('button', { name: 'Save' })
      await expect.element(saveButton).toBeDisabled()
    })

    test('кнопка Save enabled после изменения имени', async () => {
      const user = createUser({
        name: 'Test User',
      })

      renderComponent(UserEditSlideover, {
        props: { open: true, user },
      })

      const nameInput = page.getByLabelText('Name')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'New Name')

      const saveButton = page.getByRole('button', { name: 'Save' })
      await expect.element(saveButton).toBeEnabled()
    })

    test('кнопка Save disabled во время сохранения', async ({ worker }) => {
      const user = createUser({
        name: 'Test User',
      })

      // Создать handler который никогда не отвечает (имитация долгого запроса)
      worker.use(
        http.post(updateUserURL, () => {
          return new Promise(() => {}) // Never resolves
        })
      )

      renderComponent(UserEditSlideover, {
        props: { open: true, user },
      })

      const nameInput = page.getByLabelText('Name')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'New Name')

      const saveButton = page.getByRole('button', { name: 'Save' })
      await expect.element(saveButton).toBeEnabled()

      // Кликнуть Save
      await userEvent.click(saveButton)

      // Кнопка должна стать disabled во время загрузки
      await expect.element(saveButton).toBeDisabled()
    })
  })

  describe('Валидация', () => {
    test('отображение ошибки при пустом имени', async () => {
      const user = createUser({
        name: 'Test User',
      })

      renderComponent(UserEditSlideover, {
        props: { open: true, user },
      })

      const nameInput = page.getByLabelText('Name')
      await userEvent.clear(nameInput)

      // Попытка отправки формы с пустым полем
      const saveButton = page.getByRole('button', { name: 'Save' })
      await userEvent.click(saveButton)

      // Должна отобразиться ошибка валидации
      await expect.element(page.getByText('Name is required')).toBeInTheDocument()
    })
  })

  describe('API взаимодействие', () => {
    test('успешное сохранение с правильными данными', async ({ worker }) => {
      const user = createUser({
        id: 'test-user-id',
        name: 'Test User',
      })

      let requestBody: { userId: string; data: { name: string } } | null = null

      worker.use(
        http.post(updateUserURL, async ({ request }) => {
          requestBody = (await request.json()) as { userId: string; data: { name: string } }
          return HttpResponse.json({})
        })
      )

      renderComponent(UserEditSlideover, {
        props: { open: true, user },
      })

      const nameInput = page.getByLabelText('Name')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'New Name')

      const saveButton = page.getByRole('button', { name: 'Save' })
      await userEvent.click(saveButton)

      // Подождать отправки запроса
      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(requestBody).toEqual({
        userId: 'test-user-id',
        data: { name: 'New Name' },
      })
    })
  })

  describe('Edge cases', () => {
    test('slideover не отображается когда open=false', async () => {
      const user = createUser()

      renderComponent(UserEditSlideover, {
        props: { open: false, user },
      })

      await expect.element(page.getByText('Edit User')).not.toBeInTheDocument()
    })

    test('обработка пользователя с пустым name', async () => {
      const user = createUser({
        name: '',
      })

      renderComponent(UserEditSlideover, {
        props: { open: true, user },
      })

      const nameInput = page.getByLabelText('Name')
      await expect.element(nameInput).toHaveValue('')

      // Кнопка Save должна быть disabled так как форма не изменилась
      const saveButton = page.getByRole('button', { name: 'Save' })
      await expect.element(saveButton).toBeDisabled()
    })
  })
})
