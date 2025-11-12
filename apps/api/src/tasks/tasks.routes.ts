import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth.middleware.js'
import type { TasksControllers } from './tasks.controllers.js'
import {
  CreateTaskBodySchema,
  TaskParamsSchema,
  TasksQuerySchema,
  UpdateTaskBodySchema,
} from './tasks.schemas.js'

export function tasksRoutes(controllers: TasksControllers) {
  return new Hono()
    .use(requireAuth)
    .post('/', zValidator('json', CreateTaskBodySchema), async (c) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const user = c.get('user')!
      const payload = c.req.valid('json')
      const task = await controllers.createTask(user.id, payload)
      return c.json({ data: task, status: 'ok' }, 200)
    })
    .get('/', zValidator('query', TasksQuerySchema), async (c) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const user = c.get('user')!
      const query = c.req.valid('query')
      const tasks = await controllers.getTasks(user.id, query)
      return c.json(tasks, 200)
    })
    .get('/:id', zValidator('param', TaskParamsSchema), async (c) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const user = c.get('user')!
      const { id } = c.req.valid('param')
      const task = await controllers.getTask(user.id, id)

      if (!task) {
        return c.json({ message: 'Task not found', status: 404, code: 'TASK_NOT_FOUND' }, 404)
      }

      return c.json({ data: task, status: 'ok' }, 200)
    })
    .put(
      '/:id',
      zValidator('param', TaskParamsSchema),
      zValidator('json', UpdateTaskBodySchema),
      async (c) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const user = c.get('user')!
        const { id } = c.req.valid('param')
        const payload = c.req.valid('json')
        const updated = await controllers.updateTask(user.id, id, payload)
        if (!updated) {
          return c.json({ status: 'error', message: 'Task not found or unauthorized' }, 404)
        }
        return c.json({ status: 'ok', data: updated }, 200)
      },
    )
    .delete('/:id', zValidator('param', TaskParamsSchema), async (c) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const user = c.get('user')!
      const { id } = c.req.valid('param')
      const deleted = await controllers.deleteTask(user.id, id)
      if (!deleted) {
        return c.json({ status: 'Task not found or unauthorized' }, 404)
      }
      return c.json({ status: 'ok' }, 200)
    })
}
