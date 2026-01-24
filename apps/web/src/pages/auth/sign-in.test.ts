import { HttpResponse, http } from 'msw'
import { describe, expect } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createTestApp } from '@/testing/create-test-app'
import { createSession } from '@/testing/factories/session-factory'
import { getSessionURL, signInEmailURL } from '@/testing/mocks/handlers/auth'
import { test } from '@/testing/test-extend.server'

describe('Sign In Page', () => {
  test('successful login', async ({ worker }) => {
    worker.use(
      http.get(getSessionURL, () => {
        return HttpResponse.json(null)
      })
    )

    await createTestApp({
      initialRoute: '/auth',
    })

    await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
    await userEvent.type(page.getByPlaceholder('Enter your password'), 'secure-password')
    await userEvent.click(
      page.getByRole('button', {
        name: 'Continue',
      })
    )
  })

  describe('validation', () => {
    test('shows error for invalid email format', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        })
      )

      await createTestApp({
        initialRoute: '/auth',
      })

      await userEvent.type(page.getByLabelText('Email'), 'invalid-email')
      await userEvent.type(page.getByPlaceholder('Enter your password'), 'secure-password')
      await userEvent.click(
        page.getByRole('button', {
          name: 'Continue',
        })
      )

      expect(page.getByText('Invalid email')).toBeInTheDocument()
    })

    test('shows error when email is empty', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        })
      )

      await createTestApp({
        initialRoute: '/auth',
      })

      await userEvent.type(page.getByPlaceholder('Enter your password'), 'secure-password')
      await userEvent.click(
        page.getByRole('button', {
          name: 'Continue',
        })
      )

      expect(page.getByText('Invalid email')).toBeInTheDocument()
    })

    test('shows error when password is empty', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        })
      )

      await createTestApp({
        initialRoute: '/auth',
      })

      await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
      await userEvent.click(
        page.getByRole('button', {
          name: 'Continue',
        })
      )

      expect(page.getByText('Password is required')).toBeInTheDocument()
    })

    test('shows error when password is less than 8 characters', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        })
      )

      await createTestApp({
        initialRoute: '/auth',
      })

      await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(page.getByPlaceholder('Enter your password'), '1234567')
      await userEvent.click(
        page.getByRole('button', {
          name: 'Continue',
        })
      )

      expect(page.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
    })
  })

  describe('server error handling', () => {
    test('displays error when server returns authentication failure', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        }),
        http.post(signInEmailURL, () => {
          return HttpResponse.json(
            {
              code: 'INVALID_EMAIL_OR_PASSWORD',
              message: 'Invalid email or password',
            },
            {
              status: 401,
            }
          )
        })
      )

      await createTestApp({
        initialRoute: '/auth',
      })

      await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(page.getByPlaceholder('Enter your password'), 'wrongpassword')
      await userEvent.click(
        page.getByRole('button', {
          name: 'Continue',
        })
      )

      // Check that error alert is displayed
      const errorAlert = page.getByText('Invalid email or password')
      await expect.element(errorAlert).toBeInTheDocument()
    })

    test('displays generic error when server returns 500 error', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        }),
        http.post(signInEmailURL, () => {
          return HttpResponse.json(
            {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Internal server error',
            },
            {
              status: 500,
            }
          )
        })
      )

      await createTestApp({
        initialRoute: '/auth',
      })

      await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(page.getByPlaceholder('Enter your password'), 'secure-password')
      await userEvent.click(
        page.getByRole('button', {
          name: 'Continue',
        })
      )

      // Check that error alert is displayed
      const errorAlert = page.getByText('Internal server error')
      await expect.element(errorAlert).toBeInTheDocument()
    })

    test('clears previous error on new login attempt', async ({ worker }) => {
      worker.use(
        http.get(getSessionURL, () => {
          return HttpResponse.json(null)
        })
      )

      let callCount = 0
      worker.use(
        http.post(signInEmailURL, () => {
          callCount++
          if (callCount === 1) {
            // First attempt fails
            return HttpResponse.json(
              {
                code: 'INVALID_EMAIL_OR_PASSWORD',
                message: 'Invalid email or password',
              },
              {
                status: 401,
              }
            )
          }
          // Second attempt succeeds
          return HttpResponse.json(createSession())
        })
      )

      await createTestApp({
        initialRoute: '/auth',
      })

      // First attempt - should fail
      await userEvent.type(page.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(page.getByPlaceholder('Enter your password'), 'wrongpassword')
      await userEvent.click(
        page.getByRole('button', {
          name: 'Continue',
        })
      )

      // Error should be visible
      const errorAlert = page.getByText('Invalid email or password')
      await expect.element(errorAlert).toBeInTheDocument()

      // Clear the password field
      await userEvent.clear(page.getByPlaceholder('Enter your password'))

      // Second attempt - should succeed
      await userEvent.type(page.getByPlaceholder('Enter your password'), 'correctpassword')
      await userEvent.click(
        page.getByRole('button', {
          name: 'Continue',
        })
      )

      // Error should be cleared (not in document anymore)
      await expect.element(errorAlert).not.toBeInTheDocument()
    })
  })
})
