import { beforeAll, describe, expect, test } from 'vitest'
import { createAuthenticatedUser } from '../../utils/create-authenticated-user.js'
import { testClient } from '../../utils/test-client.js'

describe('Tasks API - Update (PUT /api/v1/tasks/:id)', () => {
  let authHeaders: Record<string, string>

  beforeAll(async () => {
    const auth = await createAuthenticatedUser()
    authHeaders = auth.authHeaders
  })

  describe('Successful updates', () => {
    test('should update task title', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Original title',
            description: 'Original description',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Update the title
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            title: 'Updated title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(200)
      const updateData = await updateRes.json()
      expect(updateData.status).toBe('ok')
      expect(updateData.data.title).toBe('Updated title')
      expect(updateData.data.description).toBe('Original description')
    })

    test('should update task description', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task title',
            description: 'Original description',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Update the description only
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            description: 'Updated description',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(200)
      const updateData = await updateRes.json()
      expect(updateData.data.description).toBe('Updated description')
      expect(updateData.data.title).toBe('Task title')
    })

    test('should update task completed status', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task to toggle',
            completed: false,
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Update completed status to true only
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            completed: true,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(200)
      const updateData = await updateRes.json()
      expect(updateData.data.completed).toBe(true)
    })

    test('should update all fields at once', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Original title',
            description: 'Original description',
            completed: false,
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Update all fields
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            title: 'New title',
            description: 'New description',
            completed: true,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(200)
      const updateData = await updateRes.json()
      expect(updateData.data.title).toBe('New title')
      expect(updateData.data.description).toBe('New description')
      expect(updateData.data.completed).toBe(true)
    })

    test('should update only provided fields (partial update)', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Original title',
            description: 'Original description',
            completed: false,
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Update only title (partial update)
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            title: 'Only title updated',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(200)
      const updateData = await updateRes.json()
      expect(updateData.data.title).toBe('Only title updated')
      // Unchanged fields should remain the same
      expect(updateData.data.description).toBe('Original description')
      expect(updateData.data.completed).toBe(false)
    })

    test('should update updatedAt timestamp after modification', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task for timestamp test',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id
      const originalUpdatedAt = createData.data.updatedAt

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Update the task
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            title: 'Updated title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const updateData = await updateRes.json()
      expect(updateData.data.updatedAt).not.toBe(originalUpdatedAt)
    })

    test('should not modify createdAt timestamp', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task for createdAt test',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id
      const originalCreatedAt = createData.data.createdAt

      // Update the task
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            title: 'Updated title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const updateData = await updateRes.json()
      expect(updateData.data.createdAt).toBe(originalCreatedAt)
    })
  })

  describe('Validation errors', () => {
    test('should reject update with title < 2 characters', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Valid title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Try to update with single character title
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            title: 'A',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(400)
    })

    test('should reject update with title > 100 characters', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Valid title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Try to update with 101 character title
      const longTitle = 'A'.repeat(101)
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            title: longTitle,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(400)
    })

    test('should reject update with description < 2 characters', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Valid title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Try to update with single character description
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            description: 'A',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(400)
    })

    test('should reject update with description > 1000 characters', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Valid title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Try to update with 1001 character description
      const longDescription = 'A'.repeat(1001)
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            description: longDescription,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(400)
    })

    test('should reject update with invalid completed type', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Valid title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Try to update with string instead of boolean
      // Note: TypeScript should prevent this, but we test runtime validation
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            completed: 'true' as unknown as boolean,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(400)
    })

    test('should reject update with empty body', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Valid title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {},
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(422)
    })
  })

  describe('Not found cases', () => {
    test('should return 404 for non-existent task id', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: nonExistentId,
          },
          json: {
            title: 'Updated title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(404)
    })

    test('should return 404 when trying to update another user task', async () => {
      // Create a second user with their own task
      const secondAuth = await createAuthenticatedUser()

      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'User 2 task',
          },
        },
        {
          headers: secondAuth.authHeaders,
        }
      )

      const createData = await createRes.json()
      const task2Id = createData.data.id

      // Try to update user 2's task with user 1's credentials
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: task2Id,
          },
          json: {
            title: 'Trying to update',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(404)
    })
  })

  describe('ID validation', () => {
    test('should reject invalid uuid format in id parameter', async () => {
      const invalidId = 'not-a-valid-uuid'

      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: invalidId,
          },
          json: {
            title: 'Updated title',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(updateRes.status).toBe(400)
    })
  })

  describe('Authentication', () => {
    test('should reject request without authentication token', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task for auth test',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Try to update without auth headers
      const updateRes = await testClient.api.v1.tasks[':id'].$put({
        param: {
          id: taskId,
        },
        json: {
          title: 'Updated without auth',
        },
      })

      expect(updateRes.status).toBe(401)
    })

    test('should reject request with invalid authentication token', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task for invalid auth test',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Try to update with invalid auth token
      const invalidAuthHeaders = {
        Cookie: 'better-auth.session_token=invalid-token-xyz',
        'Content-Type': 'application/json',
      }

      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: taskId,
          },
          json: {
            title: 'Updated with invalid auth',
          },
        },
        {
          headers: invalidAuthHeaders,
        }
      )

      expect(updateRes.status).toBe(401)
    })
  })

  describe('User isolation', () => {
    test('should prevent user A from updating user B tasks', async () => {
      // Create user A and user B
      const userA = await createAuthenticatedUser()
      const userB = await createAuthenticatedUser()

      // Create a task for user B
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'User B task',
            description: 'Original description',
          },
        },
        {
          headers: userB.authHeaders,
        }
      )

      const createData = await createRes.json()
      const userBTaskId = createData.data.id

      // Try to update user B's task with user A's credentials
      const updateRes = await testClient.api.v1.tasks[':id'].$put(
        {
          param: {
            id: userBTaskId,
          },
          json: {
            title: 'Trying to update user B task',
          },
        },
        {
          headers: userA.authHeaders,
        }
      )

      expect(updateRes.status).toBe(404)

      // Verify user B's task is unchanged
      const getRes = await testClient.api.v1.tasks[':id'].$get(
        {
          param: {
            id: userBTaskId,
          },
        },
        {
          headers: userB.authHeaders,
        }
      )

      expect(getRes.status).toBe(200)
      const task = await getRes.json()
      expect(task.data.id).toBe(userBTaskId)
      expect(task.data.title).toBe('User B task')
      expect(task.data.description).toBe('Original description')
    })
  })
})
