import { beforeAll, describe, expect, test } from 'vitest'
import { createAuthenticatedUser } from '../../utils/create-authenticated-user'
import { testClient } from '../../utils/test-client'

describe('Tasks API - Create (POST /api/v1/tasks)', () => {
  let authHeaders: Record<string, string>
  let userId: string

  beforeAll(async () => {
    const auth = await createAuthenticatedUser()
    authHeaders = auth.authHeaders
    userId = auth.session.user.id
  })

  describe('Successful creation', () => {
    test('should create a task with all fields', async () => {
      const res = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Test task',
            description: 'Test description',
            completed: false,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.status).toBe('ok')
      expect(data.data.title).toBe('Test task')
      expect(data.data.userId).toBe(userId)
    })

    test('should create a task with only required fields', async () => {
      const res = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Minimal task',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.data.completed).toBe(false)
    })
  })

  describe('Authentication', () => {
    test('should reject request without authentication', async () => {
      const res = await testClient.api.v1.tasks.$post({
        json: {
          title: 'Test',
        },
      })

      expect(res.status).toBe(401)
    })
  })
})
