import { HttpResponse, http } from 'msw'
import { describe, expect } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createTestApp } from '@/testing/create-test-app'
import { createSession } from '@/testing/factories/session-factory'
import { getSessionURL, signUpEmailURL } from '@/testing/mocks/handlers/auth'
import { test } from '@/testing/test-extend.server'

describe('Sign Up Page', () => {
  test('successful registration', async ({ worker }) => {
    worker.use(
      http.get(getSessionURL, () => {
        return HttpResponse.json(null)
      }),
    )

    await createTestApp({ initialRoute: '/auth/sign-up' })

    await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
    await userEvent.type(page.getByPlaceholder('Enter your password'), 'secure-password')
    await userEvent.click(page.getByRole('button', { name: 'Continue' }))
  })

  describe('validation', () => {
    test('shows error for invalid email format', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        }),
      )

      await createTestApp({ initialRoute: '/auth/sign-up' })

      await userEvent.type(page.getByLabelText('Email'), 'invalid-email')
      await userEvent.type(page.getByPlaceholder('Enter your password'), 'secure-password')
      await userEvent.click(page.getByRole('button', { name: 'Continue' }))

      expect(page.getByText('Invalid email')).toBeInTheDocument()
    })

    test('shows error when email is empty', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        }),
      )

      await createTestApp({ initialRoute: '/auth/sign-up' })

      await userEvent.type(page.getByPlaceholder('Enter your password'), 'secure-password')
      await userEvent.click(page.getByRole('button', { name: 'Continue' }))

      expect(page.getByText('Invalid email')).toBeInTheDocument()
    })

    test('shows error when password is empty', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        }),
      )

      await createTestApp({ initialRoute: '/auth/sign-up' })

      await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
      await userEvent.click(page.getByRole('button', { name: 'Continue' }))

      expect(page.getByText('Password is required')).toBeInTheDocument()
    })

    test('shows error when password is less than 8 characters', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        }),
      )

      await createTestApp({ initialRoute: '/auth/sign-up' })

      await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(page.getByPlaceholder('Enter your password'), '1234567')
      await userEvent.click(page.getByRole('button', { name: 'Continue' }))

      expect(page.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
    })
  })

  describe('server error handling', () => {
    test('displays error when user already exists', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        }),
        http.post(signUpEmailURL, () => {
          return HttpResponse.json(
            {
              code: 'USER_ALREADY_EXISTS',
              message: 'User already exists',
            },
            { status: 400 },
          )
        }),
      )

      await createTestApp({ initialRoute: '/auth/sign-up' })

      await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(page.getByPlaceholder('Enter your password'), 'secure-password')
      await userEvent.click(page.getByRole('button', { name: 'Continue' }))

      // Check that error alert is displayed
      const errorAlert = page.getByText('User already exists')
      await expect.element(errorAlert).toBeInTheDocument()
    })

    test('displays generic error when server returns 500 error', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        }),
        http.post(signUpEmailURL, () => {
          return HttpResponse.json(
            {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Internal server error',
            },
            { status: 500 },
          )
        }),
      )

      await createTestApp({ initialRoute: '/auth/sign-up' })

      await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(page.getByPlaceholder('Enter your password'), 'secure-password')
      await userEvent.click(page.getByRole('button', { name: 'Continue' }))

      // Check that error alert is displayed
      const errorAlert = page.getByText('Internal server error')
      await expect.element(errorAlert).toBeInTheDocument()
    })

    test('clears previous error on new registration attempt', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        }),
      )

      let callCount = 0
      worker.use(
        http.post(signUpEmailURL, () => {
          callCount++
          if (callCount === 1) {
            // First attempt fails
            return HttpResponse.json(
              {
                code: 'USER_ALREADY_EXISTS',
                message: 'User already exists',
              },
              { status: 400 },
            )
          }
          // Second attempt succeeds
          return HttpResponse.json(createSession())
        }),
      )

      await createTestApp({ initialRoute: '/auth/sign-up' })

      // First attempt - should fail
      await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(page.getByPlaceholder('Enter your password'), 'secure-password')
      await userEvent.click(page.getByRole('button', { name: 'Continue' }))

      // Error should be visible
      const errorAlert = page.getByText('User already exists')
      await expect.element(errorAlert).toBeInTheDocument()

      // Clear the email field and try a different email
      await userEvent.clear(page.getByLabelText('Email'))

      // Second attempt with different email - should succeed
      await userEvent.type(page.getByLabelText('Email'), 'newuser@example.com')
      await userEvent.click(page.getByRole('button', { name: 'Continue' }))

      // Error should be cleared (not in document anymore)
      await expect.element(errorAlert).not.toBeInTheDocument()
    })
  })
})
