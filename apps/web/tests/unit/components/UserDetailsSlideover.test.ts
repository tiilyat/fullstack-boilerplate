import { describe, expect } from 'vitest'
import { page } from 'vitest/browser'
import UserDetailsSlideover from '@/components/UserDetailsSlideover.vue'
import { createUser } from '../../utils/factories/user-factory'
import { renderComponent } from '../../utils/render-component'
import { test } from '../../utils/test-extend.server'

describe('UserDetailsSlideover', () => {
  describe('Секция Basic Info', () => {
    test('отображение ID, email, name, role', async () => {
      const user = createUser({
        id: 'test-id-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      })

      renderComponent(UserDetailsSlideover, {
        props: { open: true, user },
      })

      await expect.element(page.getByText('Basic Info')).toBeInTheDocument()
      await expect.element(page.getByText('test-id-123')).toBeInTheDocument()
      await expect.element(page.getByText('test@example.com')).toBeInTheDocument()
      await expect.element(page.getByText('Test User')).toBeInTheDocument()
      await expect.element(page.getByText('admin')).toBeInTheDocument()
    })

    test('отображение "-" для пустого name', async () => {
      const user = createUser({
        name: '',
      })

      renderComponent(UserDetailsSlideover, {
        props: { open: true, user },
      })

      // Check that "-" appears after "Name:" label - use exact match to avoid matching IDs with dashes
      await expect.element(page.getByText('Name:')).toBeInTheDocument()
      await expect.element(page.getByText('-', { exact: true })).toBeInTheDocument()
    })
  })

  describe('Секция Verification', () => {
    test('badge "Verified" для верифицированного пользователя', async () => {
      const verifiedUser = createUser({
        email: 'verified@example.com',
        emailVerified: true,
      })

      renderComponent(UserDetailsSlideover, {
        props: { open: true, user: verifiedUser },
      })

      await expect.element(page.getByText('Verification')).toBeInTheDocument()
      await expect.element(page.getByText('Verified', { exact: true })).toBeInTheDocument()
    })

    test('badge "Not Verified" для неверифицированного пользователя', async () => {
      const unverifiedUser = createUser({
        email: 'unverified@example.com',
        emailVerified: false,
      })

      renderComponent(UserDetailsSlideover, {
        props: { open: true, user: unverifiedUser },
      })

      await expect.element(page.getByText('Verification')).toBeInTheDocument()
      await expect.element(page.getByText('Not Verified')).toBeInTheDocument()
    })
  })

  describe('Секция Timestamps', () => {
    test('отображение Created и Updated дат', async () => {
      const user = createUser({
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-02-01'),
      })

      renderComponent(UserDetailsSlideover, {
        props: { open: true, user },
      })

      await expect.element(page.getByText('Timestamps', { exact: true })).toBeInTheDocument()
      await expect.element(page.getByText('Created:')).toBeInTheDocument()
      await expect.element(page.getByText('Updated:')).toBeInTheDocument()

      // Check formatted dates are present
      const expectedCreatedDate = new Date('2025-01-01').toLocaleDateString()
      const expectedUpdatedDate = new Date('2025-02-01').toLocaleDateString()
      await expect.element(page.getByText(expectedCreatedDate)).toBeInTheDocument()
      await expect.element(page.getByText(expectedUpdatedDate)).toBeInTheDocument()
    })
  })

  describe('Секция Ban Info', () => {
    test('отображение для забаненного пользователя', async () => {
      const bannedUser = createUser({
        banned: true,
        banReason: 'Violation of terms',
        banExpires: new Date('2025-12-31'),
      })

      renderComponent(UserDetailsSlideover, {
        props: { open: true, user: bannedUser },
      })

      await expect.element(page.getByText('Ban Info')).toBeInTheDocument()
      await expect.element(page.getByText('Violation of terms')).toBeInTheDocument()

      const expectedExpireDate = new Date('2025-12-31').toLocaleDateString()
      await expect.element(page.getByText(expectedExpireDate)).toBeInTheDocument()
    })

    test('отображение banReason если есть', async () => {
      const bannedUser = createUser({
        banned: true,
        banReason: 'Spam activity',
        banExpires: null,
      })

      renderComponent(UserDetailsSlideover, {
        props: { open: true, user: bannedUser },
      })

      await expect.element(page.getByText('Ban Info')).toBeInTheDocument()
      await expect.element(page.getByText('Spam activity')).toBeInTheDocument()
    })

    test('отображение banExpires если есть', async () => {
      const bannedUser = createUser({
        banned: true,
        banReason: null,
        banExpires: new Date('2026-06-15'),
      })

      renderComponent(UserDetailsSlideover, {
        props: { open: true, user: bannedUser },
      })

      await expect.element(page.getByText('Ban Info')).toBeInTheDocument()
      await expect.element(page.getByText('Expires:')).toBeInTheDocument()

      const expectedExpireDate = new Date('2026-06-15').toLocaleDateString()
      await expect.element(page.getByText(expectedExpireDate)).toBeInTheDocument()
    })

    test('скрытие для активного пользователя', async () => {
      const activeUser = createUser({
        banned: false,
        banReason: null,
        banExpires: null,
      })

      renderComponent(UserDetailsSlideover, {
        props: { open: true, user: activeUser },
      })

      await expect.element(page.getByText('Ban Info')).not.toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    test('отображение без переданного user (null)', async () => {
      renderComponent(UserDetailsSlideover, {
        props: { open: true, user: null },
      })

      // Slideover должен быть открыт, но контент не должен отображаться
      await expect.element(page.getByText('User Details')).toBeInTheDocument()
      await expect.element(page.getByText('Basic Info')).not.toBeInTheDocument()
    })

    test('slideover не отображается когда open=false', async () => {
      const user = createUser()

      renderComponent(UserDetailsSlideover, {
        props: { open: false, user },
      })

      await expect.element(page.getByText('User Details')).not.toBeInTheDocument()
    })
  })
})
