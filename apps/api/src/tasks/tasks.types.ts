import type { z } from 'zod'
import type { CreateTaskBodySchema, TasksQuerySchema, UpdateTaskBodySchema } from './tasks.schemas.js'

export type CreateTaskPayload = z.infer<typeof CreateTaskBodySchema>
export type UpdateTaskPayload = z.infer<typeof UpdateTaskBodySchema>
export type TasksQuery = z.infer<typeof TasksQuerySchema>
