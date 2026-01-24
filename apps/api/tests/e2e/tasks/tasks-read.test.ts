import { beforeAll, describe, expect, test } from 'vitest'
import { createAuthenticatedUser } from '../../utils/create-authenticated-user'
import { testClient } from '../../utils/test-client'

describe('Tasks API - Read (GET /tasks)', () => {
  let authHeaders: Record<string, string>
  let userId: string

  beforeAll(async () => {
    const auth = await createAuthenticatedUser()
    authHeaders = auth.authHeaders
    userId = auth.session.user.id
  })

  describe('List all tasks', () => {
    test('should return all user tasks', async () => {
      // Create multiple tasks
      await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task 1',
          },
        },
        {
          headers: authHeaders,
        }
      )
      await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task 2',
          },
        },
        {
          headers: authHeaders,
        }
      )
      await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task 3',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const res = await testClient.api.v1.tasks.$get(
        {},
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.status).toBe('ok')
      expect(Array.isArray(json.data)).toBe(true)
      expect(json.data.length).toBeGreaterThanOrEqual(3)
    })

    test('should return empty array when user has no tasks', async () => {
      // Create a new user with no tasks
      const freshUser = await createAuthenticatedUser()

      const res = await testClient.api.v1.tasks.$get(
        {},
        {
          headers: freshUser.authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.status).toBe('ok')
      expect(json.data).toEqual([])
    })

    test('should return tasks with correct structure', async () => {
      await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Structured task',
            description: 'With description',
            completed: true,
          },
        },
        {
          headers: authHeaders,
        }
      )

      const res = await testClient.api.v1.tasks.$get(
        {},
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      const task = json.data.find((t: { title: string }) => t.title === 'Structured task')

      expect(task).toBeDefined()
      expect(task).toMatchSnapshot({
        id: expect.any(String),
        userId: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    test('should return only current user tasks (isolation from other users)', async () => {
      // Create a task for the first user
      await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'User 1 task',
          },
        },
        {
          headers: authHeaders,
        }
      )

      // Create a second user with their own tasks
      const user2 = await createAuthenticatedUser()
      await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'User 2 task',
          },
        },
        {
          headers: user2.authHeaders,
        }
      )

      // Get tasks for user 1 - should only see their own task
      const res = await testClient.api.v1.tasks.$get(
        {},
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.every((t: { userId: string | null }) => t.userId === userId))
      expect(json.data.some((t: { title: string }) => t.title === 'User 1 task')).toBe(true)
      expect(json.data.some((t: { title: string }) => t.title === 'User 2 task')).toBe(false)
    })
  })

  describe('Pagination', () => {
    test('should return first 50 tasks by default', async () => {
      // Create 60 tasks
      for (let i = 0; i < 60; i++) {
        await testClient.api.v1.tasks.$post(
          {
            json: {
              title: `Task ${i}`,
            },
          },
          {
            headers: authHeaders,
          }
        )
      }

      const res = await testClient.api.v1.tasks.$get(
        {},
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.length).toBeLessThanOrEqual(50)
    })

    test('should respect limit parameter', async () => {
      // Create 20 tasks
      for (let i = 0; i < 20; i++) {
        await testClient.api.v1.tasks.$post(
          {
            json: {
              title: `Limit test ${i}`,
            },
          },
          {
            headers: authHeaders,
          }
        )
      }

      const res = await testClient.api.v1.tasks.$get(
        {
          query: {
            limit: String(10),
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.data.length).toBeLessThanOrEqual(10)
    })

    test('should respect offset parameter', async () => {
      // Create tasks with distinct titles
      const titles = ['First', 'Second', 'Third', 'Fourth', 'Fifth']
      for (const title of titles) {
        await testClient.api.v1.tasks.$post(
          {
            json: {
              title,
            },
          },
          {
            headers: authHeaders,
          }
        )
      }

      // Get first batch
      const res1 = await testClient.api.v1.tasks.$get(
        {
          query: {
            limit: String(2),
            offset: String(0),
          },
        },
        {
          headers: authHeaders,
        }
      )

      // Get second batch with offset
      const res2 = await testClient.api.v1.tasks.$get(
        {
          query: {
            limit: String(2),
            offset: String(2),
          },
        },
        {
          headers: authHeaders,
        }
      )

      const data1 = await res1.json()
      const data2 = await res2.json()

      // The batches should be different (assuming tasks are ordered)
      expect(data1.data.length).toBe(2)
      expect(data2.data.length).toBe(2)
    })

    test('should handle limit + offset together', async () => {
      // Create 15 tasks
      for (let i = 0; i < 15; i++) {
        await testClient.api.v1.tasks.$post(
          {
            json: {
              title: `Combo test ${i}`,
            },
          },
          {
            headers: authHeaders,
          }
        )
      }

      const res = await testClient.api.v1.tasks.$get(
        {
          query: {
            limit: String(5),
            offset: String(10),
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.data.length).toBeLessThanOrEqual(5)
    })

    test('should reject limit > 100', async () => {
      const res = await testClient.api.v1.tasks.$get(
        {
          query: {
            limit: String(101),
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(400)
    })

    test('should reject negative offset', async () => {
      const res = await testClient.api.v1.tasks.$get(
        {
          query: {
            offset: String(-1),
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(400)
    })
  })

  describe('Authentication', () => {
    test('should reject request without authentication token', async () => {
      const res = await testClient.api.v1.tasks.$get({})

      expect(res.status).toBe(401)
    })
  })
})

describe('Tasks API - Read Single (GET /tasks/:id)', () => {
  let authHeaders: Record<string, string>
  let userId: string

  beforeAll(async () => {
    const auth = await createAuthenticatedUser()
    authHeaders = auth.authHeaders
    userId = auth.session.user.id
  })

  describe('Successful retrieval', () => {
    test('should return task by id with full structure', async () => {
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Single task',
            description: 'Full description',
            completed: false,
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      const res = await testClient.api.v1.tasks[':id'].$get(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.status).toBe('ok')
      expect(json.data.id).toBe(taskId)
      expect(json.data).toMatchSnapshot({
        id: expect.any(String),
        userId: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    test('should return task only if it belongs to authenticated user', async () => {
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'My private task',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      const res = await testClient.api.v1.tasks[':id'].$get(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.data.userId).toBe(userId)
    })
  })

  describe('Not found cases', () => {
    test('should return 404 for non-existent task id', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const res = await testClient.api.v1.tasks[':id'].$get(
        {
          param: {
            id: nonExistentId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(404)
    })

    test('should return 404 when trying to access another user task', async () => {
      // Create a second user with their own task
      const user2 = await createAuthenticatedUser()

      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'User 2 private task',
          },
        },
        {
          headers: user2.authHeaders,
        }
      )

      const createData = await createRes.json()
      const user2TaskId = createData.data.id

      // Try to access user 2's task with user 1's credentials
      const res = await testClient.api.v1.tasks[':id'].$get(
        {
          param: {
            id: user2TaskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(404)
    })
  })

  describe('Validation', () => {
    test('should reject invalid uuid format in id parameter', async () => {
      const res = await testClient.api.v1.tasks[':id'].$get(
        {
          param: {
            id: 'not-a-uuid',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(res.status).toBe(400)
    })
  })

  describe('Authentication', () => {
    test('should reject request without authentication token', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Auth test task',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Try to get without auth headers
      const res = await testClient.api.v1.tasks[':id'].$get({
        param: {
          id: taskId,
        },
      })

      expect(res.status).toBe(401)
    })
  })
})
