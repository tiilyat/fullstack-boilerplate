import { beforeAll, describe, expect, test } from 'vitest'
import { createAuthenticatedUser } from '../../utils/create-authenticated-user.js'
import { testClient } from '../../utils/test-client.js'

describe('Tasks API - Delete (DELETE /api/v1/tasks/:id)', () => {
  let authHeaders: Record<string, string>

  beforeAll(async () => {
    const auth = await createAuthenticatedUser()
    authHeaders = auth.authHeaders
  })

  describe('Successful deletion', () => {
    test('should delete existing task', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task to delete',
            description: 'This task will be deleted',
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(createRes.status).toBe(200)
      const createData = await createRes.json()
      const taskId = createData.data.id

      // Delete the task
      const deleteRes = await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(deleteRes.status).toBe(200)
      const deleteData = await deleteRes.json()
      expect(deleteData.status).toBe('ok')
    })

    test('should return 200 status on successful deletion', async () => {
      // Create a task first
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Another task to delete',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Delete and verify status
      const deleteRes = await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(deleteRes.status).toBe(200)
    })

    test('should actually remove task from database', async () => {
      // Create a task
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task to verify deletion',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Delete the task
      await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      // Try to get the task - should return 404
      const getRes = await testClient.api.v1.tasks[':id'].$get(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(getRes.status).toBe(404)
    })

    test('should not affect other user tasks', async () => {
      // Create tasks for first user
      const task1Res = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task 1',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const task2Res = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task 2',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const task1Data = await task1Res.json()
      const task2Data = await task2Res.json()

      // Delete task 1
      await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: task1Data.data.id,
          },
        },
        {
          headers: authHeaders,
        }
      )

      // Verify task 2 still exists
      const getTask2Res = await testClient.api.v1.tasks[':id'].$get(
        {
          param: {
            id: task2Data.data.id,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(getTask2Res.status).toBe(200)
      const task2 = await getTask2Res.json()
      if ('data' in task2) {
        expect(task2.data.id).toBe(task2Data.data.id)
        expect(task2.data.title).toBe('Task 2')
      }
    })
  })

  describe('Not found cases', () => {
    test('should return 404 for non-existent task id', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const deleteRes = await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: nonExistentId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(deleteRes.status).toBe(404)
    })

    test('should return 404 when trying to delete another user task', async () => {
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

      // Try to delete user 2's task with user 1's credentials
      const deleteRes = await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: task2Id,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(deleteRes.status).toBe(404)
    })

    test('should return 404 when trying to delete already deleted task', async () => {
      // Create a task
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task for double delete test',
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Delete the task once
      const firstDeleteRes = await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(firstDeleteRes.status).toBe(200)

      // Try to delete again
      const secondDeleteRes = await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(secondDeleteRes.status).toBe(404)
    })
  })

  describe('ID validation', () => {
    test('should reject invalid uuid format in id parameter', async () => {
      const invalidId = 'not-a-valid-uuid'

      const deleteRes = await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: invalidId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(deleteRes.status).toBe(400)
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

      // Try to delete without auth headers
      const deleteRes = await testClient.api.v1.tasks[':id'].$delete({
        param: {
          id: taskId,
        },
      })

      expect(deleteRes.status).toBe(401)
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

      // Try to delete with invalid auth token
      const invalidAuthHeaders = {
        Cookie: 'better-auth.session_token=invalid-token-xyz',
        'Content-Type': 'application/json',
      }

      const deleteRes = await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: invalidAuthHeaders,
        }
      )

      expect(deleteRes.status).toBe(401)
    })
  })

  describe('User isolation', () => {
    test('should prevent user A from deleting user B tasks', async () => {
      // Create user A and user B
      const userA = await createAuthenticatedUser()
      const userB = await createAuthenticatedUser()

      // Create a task for user B
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'User B task',
          },
        },
        {
          headers: userB.authHeaders,
        }
      )

      const createData = await createRes.json()
      const userBTaskId = createData.data.id

      // Try to delete user B's task with user A's credentials
      const deleteRes = await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: userBTaskId,
          },
        },
        {
          headers: userA.authHeaders,
        }
      )

      expect(deleteRes.status).toBe(404)

      // Verify user B's task still exists
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
    })
  })

  describe('Cascading effects', () => {
    test('should handle deletion of tasks with related data (if any)', async () => {
      // Create a task with full data (title, description, completed status)
      const createRes = await testClient.api.v1.tasks.$post(
        {
          json: {
            title: 'Task with related data',
            description: 'This task has description',
            completed: true,
          },
        },
        {
          headers: authHeaders,
        }
      )

      const createData = await createRes.json()
      const taskId = createData.data.id

      // Delete the task
      const deleteRes = await testClient.api.v1.tasks[':id'].$delete(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(deleteRes.status).toBe(200)

      // Verify it's fully removed
      const getRes = await testClient.api.v1.tasks[':id'].$get(
        {
          param: {
            id: taskId,
          },
        },
        {
          headers: authHeaders,
        }
      )

      expect(getRes.status).toBe(404)
    })
  })
})
