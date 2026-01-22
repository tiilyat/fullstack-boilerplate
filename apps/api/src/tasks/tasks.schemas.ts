import { z } from 'zod'

export const TaskSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const CreateTaskBodySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
})

export const UpdateTaskBodySchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(1000).optional(),
  completed: z.boolean().optional(),
})

export const TaskParamsSchema = z.object({
  id: z.uuid(),
})

export const TasksQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().int().min(0).max(100000).default(0).optional(),
  })
  .optional()
