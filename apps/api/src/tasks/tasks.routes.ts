import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
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
      // biome-ignore lint/style/noNonNullAssertion: it's private route, user authenticated
      const user = c.get('user')!
      const payload = c.req.valid('json')
      const task = await controllers.createTask(user.id, payload)
      return c.json({ data: task, status: 'ok' }, 200)
    })
    .get('/', zValidator('query', TasksQuerySchema), async (c) => {
      // biome-ignore lint/style/noNonNullAssertion: it's private route, user authenticated
      const user = c.get('user')!
      const query = c.req.valid('query')
      const tasks = await controllers.getTasks(user.id, query)
      return c.json({ data: tasks, status: 'ok' }, 200)
    })
    .get('/:id', zValidator('param', TaskParamsSchema), async (c) => {
      // biome-ignore lint/style/noNonNullAssertion: it's private route, user authenticated
      const user = c.get('user')!
      const { id } = c.req.valid('param')
      const task = await controllers.getTask(user.id, id)

      if (!task) {
        throw new HTTPException(404, { message: 'Task not found' })
      }

      return c.json({ data: task, status: 'ok' }, 200)
    })
    .put(
      '/:id',
      zValidator('param', TaskParamsSchema),
      zValidator('json', UpdateTaskBodySchema),
      async (c) => {
        // biome-ignore lint/style/noNonNullAssertion: it's private route, user authenticated
        const user = c.get('user')!
        const { id } = c.req.valid('param')
        const payload = c.req.valid('json')
        const updated = await controllers.updateTask(user.id, id, payload)

        if (!updated) {
          throw new HTTPException(404, { message: 'Task not found' })
        }

        return c.json({ status: 'ok', data: updated }, 200)
      },
    )
    .delete('/:id', zValidator('param', TaskParamsSchema), async (c) => {
      // biome-ignore lint/style/noNonNullAssertion: it's private route, user authenticated
      const user = c.get('user')!
      const { id } = c.req.valid('param')
      const deleted = await controllers.deleteTask(user.id, id)

      if (!deleted) {
        throw new HTTPException(404, { message: 'Task not found' })
      }

      return c.json({ status: 'ok' }, 200)
    })
}
